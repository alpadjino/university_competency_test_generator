import { Body, Controller, Post, Route, Tags } from 'tsoa';
import { AiAdditionQuestion, AiCorrectSequenceQuestion, AiMatchingQuestion, AiMultipleQuestion, AiOneQuestion, AiQuestionItem, AiQuestionResponse, GenerateQuestionsRequest, GenerateQuestionsResponse, IChatResponse } from '../views/Agent';
import { ClosedQuestionSubtype, OpenQuestionSubtype, QuestionCategory, QuestionType } from '../models/enums/Agent';
import { QuestionSubtypeMapper } from '../dto/Agent';
import { Question, QuestionOptionsDb } from '../models/Agent';

const MODEL_BATCH_SIZE = 5;
const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const MAX_RETRIES_MULTIPLIER = 3;

@Route("agent")
@Tags("Agent")
export class AgentController extends Controller {
  @Post("generate")
  public async generate(
    @Body() body: GenerateQuestionsRequest
  ): Promise<void> {
    try {
      const targetCount = body.questionsCount ?? 5;
      let finalQuestions: AiQuestionItem[] = [];

      let attempts = 0;
      const maxAttempts = Math.ceil(targetCount / MODEL_BATCH_SIZE) * MAX_RETRIES_MULTIPLIER;

      const typeEnum = QuestionSubtypeMapper.isClosed(body.questionsSubType) ? QuestionType.CLOSED : QuestionType.OPEN;
      const subtypeEnum = QuestionSubtypeMapper.toEnum(body.questionsSubType);

      const enrichedText = this.enrichTextWithTemplate(
        body.promptText,
        QuestionSubtypeMapper.isClosed(body.questionsSubType) ? QuestionType.CLOSED : QuestionType.OPEN,
        QuestionSubtypeMapper.toEnum(body.questionsSubType)
      );

      while (finalQuestions.length < targetCount && attempts < maxAttempts) {
        attempts++;
        const neededCount = targetCount - finalQuestions.length;
        const currentBatchSize = Math.min(neededCount, MODEL_BATCH_SIZE);

        const systemInstruction = this.buildSystemPrompt(typeEnum, subtypeEnum, currentBatchSize);

        const requestBody = {
          model: 'hodza/cotype-nano-1.5-unofficial',
          stream: false,
          format: 'json',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: enrichedText }
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
            signal: controller.signal
          });

          if (!response.ok) {
            throw new Error(`Ollama HTTP error! status: ${response.status}`);
          }

          const chatResponse = (await response.json()) as IChatResponse;

          let jsonContent = chatResponse?.message?.content;

          if (!jsonContent || jsonContent.trim() === '') {
            continue;
          }

          try {
            // Очистка от возможных markdown-тегов ```json ... ```
            jsonContent = jsonContent.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(jsonContent) as AiQuestionResponse;

            if (parsedData?.questions && Array.isArray(parsedData.questions)) {
              finalQuestions.push(...parsedData.questions);
            }
          } catch (jsonError) {
            console.warn(`Attempt ${attempts}: Failed to parse JSON, retrying...`);
            continue;
          }
        } finally {
          clearTimeout(timeoutId);
        }
      }

      if (finalQuestions.length < targetCount) {
        console.warn(`Managed to generate only ${finalQuestions.length} out of ${targetCount} questions after ${attempts} attempts.`);
      }

      finalQuestions = finalQuestions.slice(0, targetCount);

      const lastQuestion = await Question.findOne({
        where: { testId: body.testId },
        order: [['order', 'DESC']],
        attributes: ['order'],
      });
      const startOrder = lastQuestion?.order ? lastQuestion.order + 1 : 1;

      const questionsToSave = finalQuestions.map((q, index) => {
        const { options, standardAnswer } = AgentController.toDbFormat(q, subtypeEnum);

        return {
          testId: body.testId,
          category: QuestionCategory.B,
          type: typeEnum,
          subtype: subtypeEnum,
          text: body.promptText,
          question: q.question,
          options,
          standardAnswer,
          order: startOrder + index,
        };
      });

      await Question.bulkCreate(questionsToSave);

      this.setStatus(200);
      return;

    } catch (error) {
      console.error('Error in AgentController.generate:', error);
      this.setStatus(500);
      throw new Error('Internal Server Error during question generation');
    }
  }

  private enrichTextWithTemplate(rawText: string, type: QuestionType, subType: ClosedQuestionSubtype | OpenQuestionSubtype): string {
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

  private buildSystemPrompt(type: QuestionType, subType: ClosedQuestionSubtype | OpenQuestionSubtype, count: number): string {
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
  };

  static toDbFormat(
    aiItem: AiQuestionItem,
    subType: ClosedQuestionSubtype | OpenQuestionSubtype
  ): { options: QuestionOptionsDb; standardAnswer: string | null } {

    switch (subType) {
      case ClosedQuestionSubtype.ONE: {
        const item = aiItem as AiOneQuestion;
        return {
          options: item.options?.map(opt => ({
            text: opt,
            isTrue: opt === item.correct_answer
          })) || [],
          standardAnswer: item.correct_answer || null
        };
      }

      case ClosedQuestionSubtype.MULTIPLE: {
        const item = aiItem as AiMultipleQuestion;
        return {
          options: item.options?.map(opt => ({
            text: opt,
            isTrue: item.correct_answers?.includes(opt) || false
          })) || [],
          standardAnswer: item.correct_answers ? JSON.stringify(item.correct_answers) : null
        };
      }

      case ClosedQuestionSubtype.MATCHING: {
        // Ожидаем, что left_column и right_column теперь массивы объектов {id: string, text: string}
        const item = aiItem as AiMatchingQuestion;
        return {
          options: {
            left: item.left_column || [],
            right: item.right_column || []
          },
          standardAnswer: item.correct_mapping ? JSON.stringify(item.correct_mapping) : null
        };
      }

      case ClosedQuestionSubtype.CORRECT_SEQUENCE: {
        // Ожидаем, что items теперь массив объектов {id: string, text: string}
        const item = aiItem as AiCorrectSequenceQuestion;
        return {
          options: item.items || [],
          standardAnswer: item.correct_sequence ? JSON.stringify(item.correct_sequence) : null
        };
      }

      case OpenQuestionSubtype.ADDITION: {
        const item = aiItem as AiAdditionQuestion;
        return {
          options: null,
          standardAnswer: item.correct_answer || null
        };
      }

      case OpenQuestionSubtype.DETAILED_ANSWER:
      default: {
        return {
          options: null,
          standardAnswer: null
        };
      }
    }
  }
};
