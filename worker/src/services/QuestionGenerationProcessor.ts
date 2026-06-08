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
import { parseModelJsonResponse } from '../utils/parseModelJson';
import { buildQuestionResponseSchema } from '../utils/questionSchemas';
import { buildOllamaRequestOptions, ollamaConfig } from '../config/ollama';
import type { GenerateQuestionsJobData } from '../queue/jobs';

const PLACEHOLDER_GENERATING = 'Вопрос генерируется…';

export class QuestionGenerationProcessor {
  static async processJob(data: GenerateQuestionsJobData): Promise<void> {
    const tasks = await GenerationTask.findAll({
      where: {
        id: { [Op.in]: data.taskIds },
        status: GenerationStatus.QUEUED,
      },
      order: [['createdAt', 'ASC']],
    });

    if (tasks.length === 0) {
      return;
    }

    const questions = await Question.findAll({
      where: { id: { [Op.in]: tasks.map((task) => task.questionId) } },
      order: [['order', 'ASC']],
    });

    const type = data.questionType as QuestionType;
    const subtype = data.subtype as QuestionSubtype;
    const taskIds = tasks.map((task) => task.id);
    const questionIds = questions.map((question) => question.id);

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
        data.promptText,
        type,
        subtype,
        questions.length
      );

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const aiItem = generated[i];

        if (!aiItem) {
          await this.markFailed(question.id, tasks[i].id, 'Не удалось сгенерировать вопрос');
          continue;
        }

        const { options, standardAnswer } = toDbFormat(aiItem, subtype);

        await question.update({
          question: aiItem.question,
          options,
          standardAnswer,
          generationStatus: GenerationStatus.COMPLETED,
        });
        await tasks[i].update({ status: GenerationStatus.COMPLETED });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка генерации';
      console.error('QuestionGenerationProcessor.processJob:', error);

      for (let i = 0; i < questions.length; i++) {
        await this.markFailed(questions[i].id, tasks[i].id, message);
      }
    }
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
    const maxAttempts = Math.max(
      ollamaConfig.minGenerationAttempts,
      Math.ceil(count / ollamaConfig.modelBatchSize) * ollamaConfig.maxRetriesMultiplier
    );

    const enrichedText = this.enrichTextWithTemplate(promptText, type, subtype);

    while (finalQuestions.length < count && attempts < maxAttempts) {
      attempts++;
      const neededCount = count - finalQuestions.length;
      const currentBatchSize = Math.min(neededCount, ollamaConfig.modelBatchSize);
      const systemInstruction = this.buildSystemPrompt(type, subtype, currentBatchSize);
      const responseSchema = buildQuestionResponseSchema(type, subtype, currentBatchSize);

      const requestBody = {
        model: ollamaConfig.model,
        stream: false,
        format: responseSchema,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: enrichedText },
        ],
        options: buildOllamaRequestOptions(),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ollamaConfig.requestTimeoutMs);

      try {
        const response = await fetch(`${ollamaConfig.apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Ollama HTTP error! status: ${response.status}`);
        }

        const chatResponse = (await response.json()) as IChatResponse;
        const jsonContent = chatResponse?.message?.content;

        if (!jsonContent || jsonContent.trim() === '') {
          continue;
        }

        const parsedData = parseModelJsonResponse<AiQuestionResponse>(jsonContent);

        if (parsedData?.questions && Array.isArray(parsedData.questions)) {
          finalQuestions.push(...parsedData.questions);
          continue;
        }

        console.warn(
          `Generation attempt ${attempts}: invalid JSON response:`,
          jsonContent.slice(0, 120)
        );
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
          subTypeInstruction =
            'Создай вопросы с выбором одного правильного ответа (ровно 4 варианта). correct_answer ОБЯЗАН дословно совпадать с одним из элементов массива options.';
          break;
        case ClosedQuestionSubtype.MULTIPLE:
          jsonStructure = `{ "questions": [{ "question": "Текст содержательного вопроса", "options": ["Текст правильного ответа 1", "Текст правильного ответа 2", "Текст ложного ответа 1", "Текст ложного ответа 2"], "correct_answers": ["Текст правильного ответа 1", "Текст правильного ответа 2"] }] }`;
          subTypeInstruction =
            'Создай вопросы, где ОБЯЗАТЕЛЬНО БУДЕТ несколько правильных ответов. Используй поле "correct_answers" (массив). Каждый элемент correct_answers ОБЯЗАН дословно совпадать с одним из элементов options.';
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
6. Язык вопросов и ответов должен совпадать с языком текста.
8. Дополнительно формат ответа задан JSON Schema в API — следуй ему строго.`;
  }
}
