import { Op } from 'sequelize';
import { GenerationTask } from '../models/GenerationTask';
import { Question } from '../models/Question';
import { GenerationStatus } from '../models/enums/GenerationStatus';
import {
  ClosedQuestionSubtype,
  OpenQuestionSubtype,
  QuestionSubtype,
  QuestionType,
} from '../models/enums/Question';
import { AiQuestionItem, AiQuestionResponse, IChatResponse } from '../types/ai';
import { toDbFormat } from '../utils/toDbFormat';

const MODEL_BATCH_SIZE = 5;
const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'hodza/cotype-nano-1.5-unofficial';
const MAX_RETRIES_MULTIPLIER = 3;

const PLACEHOLDER_GENERATING = 'Вопрос генерируется…';

type TaskGroup = {
  testId: number;
  promptText: string;
  type: QuestionType;
  subtype: QuestionSubtype;
  tasks: GenerationTask[];
  questions: Question[];
};

export class QuestionGenerationProcessor {
  static async processQueue(): Promise<void> {
    const group = await this.pickNextGroup();
    if (!group) {
      return;
    }

    const taskIds = group.tasks.map((task) => task.id);
    const questionIds = group.questions.map((question) => question.id);

    await GenerationTask.update(
      { status: GenerationStatus.GENERATING },
      { where: { id: { [Op.in]: taskIds } } }
    );
    await Question.update(
      { generationStatus: GenerationStatus.GENERATING, question: PLACEHOLDER_GENERATING },
      { where: { id: { [Op.in]: questionIds } } }
    );

    try {
      const generated = await this.generateWithOllama(
        group.promptText,
        group.type,
        group.subtype,
        group.questions.length
      );

      for (let i = 0; i < group.questions.length; i++) {
        const question = group.questions[i];
        const aiItem = generated[i];

        if (!aiItem) {
          await this.markFailed(question.id, group.tasks[i].id, 'Не удалось сгенерировать вопрос');
          continue;
        }

        const { options, standardAnswer } = toDbFormat(aiItem, group.subtype);

        await question.update({
          question: aiItem.question,
          options,
          standardAnswer,
          generationStatus: GenerationStatus.COMPLETED,
        });
        await group.tasks[i].update({ status: GenerationStatus.COMPLETED });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка генерации';
      console.error('QuestionGenerationProcessor.processQueue:', error);

      for (let i = 0; i < group.questions.length; i++) {
        await this.markFailed(group.questions[i].id, group.tasks[i].id, message);
      }
    }
  }

  private static async pickNextGroup(): Promise<TaskGroup | null> {
    const firstTask = await GenerationTask.findOne({
      where: { status: GenerationStatus.QUEUED },
      order: [['createdAt', 'ASC']],
    });

    if (!firstTask) {
      return null;
    }

    const firstQuestion = await Question.findByPk(firstTask.questionId);
    if (!firstQuestion) {
      return null;
    }

    const queuedTasks = await GenerationTask.findAll({
      where: {
        status: GenerationStatus.QUEUED,
        testId: firstTask.testId,
        promptText: firstTask.promptText,
      },
      order: [['createdAt', 'ASC']],
      limit: 50,
    });

    const siblingTasks: GenerationTask[] = [];

    for (const task of queuedTasks) {
      const question = await Question.findByPk(task.questionId);
      if (
        question &&
        question.type === firstQuestion.type &&
        question.subtype === firstQuestion.subtype
      ) {
        siblingTasks.push(task);
        if (siblingTasks.length >= MODEL_BATCH_SIZE) {
          break;
        }
      }
    }

    if (siblingTasks.length === 0) {
      return null;
    }

    const questions = await Question.findAll({
      where: {
        id: { [Op.in]: siblingTasks.map((task) => task.questionId) },
      },
      order: [['order', 'ASC']],
    });

    return {
      testId: firstTask.testId,
      promptText: firstTask.promptText,
      type: firstQuestion.type,
      subtype: firstQuestion.subtype,
      tasks: siblingTasks,
      questions,
    };
  }

  private static async markFailed(questionId: number, taskId: number, message: string): Promise<void> {
    await Question.update(
      {
        generationStatus: GenerationStatus.FAILED,
        question: `Ошибка генерации: ${message}`,
      },
      { where: { id: questionId } }
    );
    await GenerationTask.update(
      { status: GenerationStatus.FAILED, errorMessage: message },
      { where: { id: taskId } }
    );
  }

  private static async generateWithOllama(
    promptText: string,
    type: QuestionType,
    subtype: QuestionSubtype,
    count: number
  ): Promise<AiQuestionItem[]> {
    let finalQuestions: AiQuestionItem[] = [];
    let attempts = 0;
    const maxAttempts = Math.ceil(count / MODEL_BATCH_SIZE) * MAX_RETRIES_MULTIPLIER;

    const enrichedText = this.enrichTextWithTemplate(promptText, type, subtype);

    while (finalQuestions.length < count && attempts < maxAttempts) {
      attempts++;
      const neededCount = count - finalQuestions.length;
      const currentBatchSize = Math.min(neededCount, MODEL_BATCH_SIZE);
      const systemInstruction = this.buildSystemPrompt(type, subtype, currentBatchSize);

      const requestBody = {
        model: OLLAMA_MODEL,
        stream: false,
        format: 'json',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: enrichedText },
        ],
        options: {
          temperature: 0.7,
          seed: Math.floor(Math.random() * 1000000),
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3 * 60 * 1000);

      try {
        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Ollama HTTP error! status: ${response.status}`);
        }

        const chatResponse = (await response.json()) as IChatResponse;
        let jsonContent = chatResponse?.message?.content;

        if (!jsonContent || jsonContent.trim() === '') {
          continue;
        }

        jsonContent = jsonContent.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(jsonContent) as AiQuestionResponse;

        if (parsedData?.questions && Array.isArray(parsedData.questions)) {
          finalQuestions.push(...parsedData.questions);
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          throw error;
        }
        console.warn(`Generation attempt ${attempts} failed, retrying...`);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (finalQuestions.length < count) {
      console.warn(`Generated only ${finalQuestions.length} of ${count} questions`);
    }

    return finalQuestions.slice(0, count);
  }

  private static enrichTextWithTemplate(
    rawText: string,
    type: QuestionType,
    subType: QuestionSubtype
  ): string {
    let analysisInstruction = 'Проанализируй следующий текст и выдели из него ключевые факты.';

    if (type === QuestionType.OPEN) {
      if (subType === OpenQuestionSubtype.DETAILED_ANSWER) {
        analysisInstruction = 'Определи главную проблематику, философские или причинно-следственные связи текста для глубоких вопросов.';
      } else if (subType === OpenQuestionSubtype.ADDITION) {
        analysisInstruction = 'Выбери из текста короткое утвердительное предложение. Одно важное слово в нем замени на [____].';
      }
    } else {
      switch (subType) {
        case ClosedQuestionSubtype.MATCHING:
          analysisInstruction = 'Найди в тексте списки связанных пар (например: дата-событие, термин-определение, автор-произведение).';
          break;
        case ClosedQuestionSubtype.CORRECT_SEQUENCE:
          analysisInstruction = 'Выдели хронологическую последовательность событий или логические этапы процесса, описанного в тексте.';
          break;
        case ClosedQuestionSubtype.ONE:
          analysisInstruction = 'Найди однозначные факты для создания тестов с одним верным ответом.';
          break;
        case ClosedQuestionSubtype.MULTIPLE:
          analysisInstruction = 'Найди фрагменты текста с перечислениями или наборами характеристик для вопросов с несколькими ответами.';
          break;
      }
    }

    return `${analysisInstruction}\n\nТекст для анализа:\n---\n${rawText}\n---`;
  }

  private static buildSystemPrompt(
    type: QuestionType,
    subType: QuestionSubtype,
    count: number
  ): string {
    let jsonStructure = '';
    let subTypeInstruction = '';

    if (type === QuestionType.OPEN) {
      if (subType === OpenQuestionSubtype.DETAILED_ANSWER) {
        jsonStructure = `{ "questions": [{ "question": "Текст вопроса" }] }`;
        subTypeInstruction = 'Создай открытые вопросы, требующие развернутого и аргументированного ответа (эссе).';
      } else if (subType === OpenQuestionSubtype.ADDITION) {
        jsonStructure = `{ "questions": [{ "question": "Текст утверждения с [____]", "correct_answer": "слово" }] }`;
        subTypeInstruction = `ЗАПРЕЩЕНО использовать знаки вопроса (?) и вопросительные слова.
  Твоя задача — копировать предложение из текста «как есть» и вставить [____].
  
  ПРИМЕР КОРРЕКТНОГО ОТВЕТА:
  - question: "Традиционные методы ФОС имеют низкую [____] обновления материалов."
  - correct_answer: "скорость"`;
      }
    } else {
      switch (subType) {
        case ClosedQuestionSubtype.ONE:
          jsonStructure = `{ "questions": [{ "question": "Текст содержательного вопроса", "options": ["Текст правильного ответа 1", "Текст ложного ответа 1", "Текст ложного ответа 2", "Текст ложного ответа 3"], "correct_answer": "Текст правильного ответа 1" }] }`;
          subTypeInstruction = 'Создай вопросы с выбором одного правильного ответа.';
          break;
        case ClosedQuestionSubtype.MULTIPLE:
          jsonStructure = `{ "questions": [{ "question": "Текст содержательного вопроса", "options": ["Текст правильного ответа 1", "Текст правильного ответа 2", "Текст ложного ответа 1", "Текст ложного ответа 2"], "correct_answers": ["Текст правильного ответа 1", "Текст правильного ответа 2"] }] }`;
          subTypeInstruction = 'Создай вопросы, где ОБЯЗАТЕЛЬНО БУДЕТ правильных ответов. Используй поле "correct_answers" (массив).';
          break;
        case ClosedQuestionSubtype.MATCHING:
          jsonStructure = `{ "questions": [{ "question": "Заголовок задания", "left_column": [{ "id": "1", "text": "Элемент 1" }, { "id": "2", "text": "Элемент 2" }], "right_column": [{ "id": "А", "text": "Описание А" }, { "id": "Б", "text": "Описание Б" }], "correct_mapping": { "1": "Б", "2": "А" } }] }`;
          subTypeInstruction = 'Создай задание на сопоставление. Левый столбец должен использовать числовые "id" ("1", "2"...), а правый буквенные ("А", "Б"...). Правильный ответ (correct_mapping) представляет собой объект связи числа и буквы.';
          break;
        case ClosedQuestionSubtype.CORRECT_SEQUENCE:
          jsonStructure = `{ "questions": [{ "question": "Заголовок", "items": [{ "id": "1", "text": "Действие В" }, { "id": "2", "text": "Действие А" }, { "id": "3", "text": "Действие Б" }], "correct_sequence": ["2", "3", "1"] }] }`;
          subTypeInstruction = 'Создай задание на определение правильного порядка. Каждому элементу в "items" присвой уникальный числовой "id" в случайном порядке. В "correct_sequence" укажи массив "id" в правильной хронологической последовательности.';
          break;
      }
    }

    return `Ты — профессиональный эксперт по созданию образовательных тестов.
Твоя задача: сгенерировать ровно ${count} вопросов типа "${type}" (подтип: "${subType}").

ПРАВИЛА:
1. ${subTypeInstruction}
2. Все вопросы и ВАРИАНТЫ ОТВЕТОВ должны базироваться только на предоставленном тексте.
3. Ответ должен быть СТРОГО в формате JSON.
4. Структура JSON должна соответствовать этому шаблону:
${jsonStructure}
5. Массив "questions" должен содержать ровно ${count} элементов.
6. Язык вопросов и ответов должен совпадать с языком текста.`;
  }
}
