import { QuestionSubtypeMapper } from '../dto/Agent';
import { GenerationTask } from '../models/GenerationTask';
import { Question } from '../models/Agent';
import { GenerationStatus } from '../models/enums/GenerationStatus';
import { QuestionCategory, QuestionType } from '../models/enums/Agent';
import { GenerateQuestionsRequest } from '../views/Agent';

const PLACEHOLDER_QUEUED = 'Вопрос в очереди на генерацию';

export class QuestionEnqueueService {
  static async enqueue(body: GenerateQuestionsRequest): Promise<number[]> {
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

      await GenerationTask.create({
        questionId: question.id,
        testId: body.testId,
        promptText: body.promptText,
        status: GenerationStatus.QUEUED,
      });

      questionIds.push(question.id);
    }

    return questionIds;
  }
}
