import {
  ClosedQuestionSubtype,
  OpenQuestionSubtype,
  QuestionSubtype,
  QuestionType,
} from '../models/enums/Question';

type JsonSchema = Record<string, unknown>;

const stringSchema = { type: 'string' };

const columnItemSchema: JsonSchema = {
  type: 'object',
  properties: {
    id: stringSchema,
    text: stringSchema,
  },
  required: ['id', 'text'],
};

const openQuestionItemSchemas: Record<OpenQuestionSubtype, JsonSchema> = {
  [OpenQuestionSubtype.DETAILED_ANSWER]: {
    type: 'object',
    properties: {
      question: stringSchema,
    },
    required: ['question'],
  },
  [OpenQuestionSubtype.ADDITION]: {
    type: 'object',
    properties: {
      question: stringSchema,
      correct_answer: stringSchema,
    },
    required: ['question', 'correct_answer'],
  },
};

const closedQuestionItemSchemas: Record<ClosedQuestionSubtype, JsonSchema> = {
  [ClosedQuestionSubtype.ONE]: {
    type: 'object',
    properties: {
      question: stringSchema,
      options: {
        type: 'array',
        items: stringSchema,
        minItems: 4,
        maxItems: 4,
      },
      correct_answer: stringSchema,
    },
    required: ['question', 'options', 'correct_answer'],
  },
  [ClosedQuestionSubtype.MULTIPLE]: {
    type: 'object',
    properties: {
      question: stringSchema,
      options: {
        type: 'array',
        items: stringSchema,
        minItems: 4,
      },
      correct_answers: {
        type: 'array',
        items: stringSchema,
        minItems: 1,
      },
    },
    required: ['question', 'options', 'correct_answers'],
  },
  [ClosedQuestionSubtype.MATCHING]: {
    type: 'object',
    properties: {
      question: stringSchema,
      left_column: {
        type: 'array',
        items: columnItemSchema,
        minItems: 2,
      },
      right_column: {
        type: 'array',
        items: columnItemSchema,
        minItems: 2,
      },
      correct_mapping: {
        type: 'object',
        additionalProperties: stringSchema,
      },
    },
    required: ['question', 'left_column', 'right_column', 'correct_mapping'],
  },
  [ClosedQuestionSubtype.CORRECT_SEQUENCE]: {
    type: 'object',
    properties: {
      question: stringSchema,
      items: {
        type: 'array',
        items: columnItemSchema,
        minItems: 2,
      },
      correct_sequence: {
        type: 'array',
        items: stringSchema,
        minItems: 2,
      },
    },
    required: ['question', 'items', 'correct_sequence'],
  },
};

function questionsArraySchema(items: JsonSchema, count: number): JsonSchema {
  return {
    type: 'array',
    minItems: count,
    maxItems: count,
    items,
  };
}

function rootSchema(questions: JsonSchema): JsonSchema {
  return {
    type: 'object',
    properties: {
      questions,
    },
    required: ['questions'],
  };
}

function buildQuestionItemSchema(type: QuestionType, subtype: QuestionSubtype): JsonSchema {
  if (type === QuestionType.OPEN) {
    return openQuestionItemSchemas[subtype as OpenQuestionSubtype];
  }

  return closedQuestionItemSchemas[subtype as ClosedQuestionSubtype];
}

export function buildQuestionResponseSchema(
  type: QuestionType,
  subtype: QuestionSubtype,
  count: number
): JsonSchema {
  return rootSchema(questionsArraySchema(buildQuestionItemSchema(type, subtype), count));
}
