import { QuestionSubtypeMapper } from '../dto/Agent';
import { GenerationTask } from '../models/GenerationTask';
import { Question } from '../models/Agent';
import { Test } from '../models/Tests';
import { GenerationStatus } from '../models/enums/GenerationStatus';
import { QuestionCategory, QuestionType } from '../models/enums/Agent';
import { GenerateQuestionsRequest } from '../views/Agent';
import { getBoss } from '../queue/boss';
import { GENERATE_QUESTIONS_QUEUE } from '../queue/jobs';

const PLACEHOLDER_QUEUED = 'Вопрос в очереди на генерацию';

export class TestNotFoundError extends Error {
  constructor(testId: number) {
    super(`Тест с id=${testId} не найден`);
    this.name = 'TestNotFoundError';
  }
}

export class QuestionEnqueueService {
  static async enqueue(body: GenerateQuestionsRequest): Promise<number[]> {
    const test = await Test.findByPk(body.testId);
    if (!test) {
      throw new TestNotFoundError(body.testId);
    }

    const count = body.questionsCount ?? 5;
    const typeEnum = QuestionSubtypeMapper.isClosed(body.questionsSubType)
      ? QuestionType.CLOSED
      : QuestionType.OPEN;
    const subtypeEnum = QuestionSubtypeMapper.toEnum(body.questionsSubType);

    const lastQuestion = await Question.findOne({
      where: { testId: body.testId },
      order: [['order', 'DESC']],
      attributes: ['order'],
    });
    const startOrder = lastQuestion?.order ? lastQuestion.order + 1 : 1;

    const questionIds: number[] = [];
    const taskIds: number[] = [];

    for (let i = 0; i < count; i++) {
      const question = await Question.create({
        testId: body.testId,
        category: QuestionCategory.B,
        type: typeEnum,
        subtype: subtypeEnum,
        text: body.promptText,
        question: PLACEHOLDER_QUEUED,
        options: null,
        standardAnswer: null,
        order: startOrder + i,
        generationStatus: GenerationStatus.QUEUED,
      });

      const task = await GenerationTask.create({
        questionId: question.id,
        testId: body.testId,
        promptText: body.promptText,
        status: GenerationStatus.QUEUED,
      });

      questionIds.push(question.id);
      taskIds.push(task.id);
    }

    const boss = await getBoss();
    await boss.send(GENERATE_QUESTIONS_QUEUE, {
      taskIds,
      promptText: body.promptText,
      questionType: typeEnum,
      subtype: subtypeEnum,
    });

    return questionIds;
  }
}
