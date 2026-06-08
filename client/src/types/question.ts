export type QuestionCategory = "A" | "B" | "C";
export type QuestionType = "Closed" | "Open";
export type GenerationStatus = "queued" | "generating" | "completed" | "failed";
export type ClosedQuestionSubtype = "One" | "Multiple" | "Matching" | "CorrectSequence";
export type OpenQuestionSubtype = "DetailedAnswer" | "Addition";

export type ChoiceOptionsDb = Array<{ text: string; isTrue: boolean }>;
export type MatchingOptionsDb = { left: Array<{ id: string, text: string }>; right: Array<{ id: string, text: string }> };
export type SequenceOptionsDb = Array<{ id: string, text: string }>;

export type QuestionOptionsDb =
  | ChoiceOptionsDb
  | MatchingOptionsDb
  | SequenceOptionsDb
  | null;

export interface QuestionEditable {
  id: number;
  text: string;
  category: QuestionCategory;
  type: QuestionType;
  question: string;
  subtype: ClosedQuestionSubtype | OpenQuestionSubtype;
  options: QuestionOptionsDb;
  standardAnswer: string;
  order: number;
  generationStatus?: GenerationStatus | null;
}

export const isQuestionPending = (question: QuestionEditable) =>
  question.generationStatus === 'queued' || question.generationStatus === 'generating';

export const isQuestionFailed = (question: QuestionEditable) =>
  question.generationStatus === 'failed';

const QUESTION_LABELS: {
  [K in QuestionType]: {
    label: string;
    subtypes: Record<K extends "Closed" ? ClosedQuestionSubtype : OpenQuestionSubtype, string>;
  };
} = {
  Closed: {
    label: "ЗЗТ",
    subtypes: {
      One: "ЗЗТ О",
      Multiple: "ЗЗТ НО",
      Matching: "ЗЗТ С",
      CorrectSequence: "ЗЗТ ПП",
    },
  },
  Open: {
    label: "ЗОТ",
    subtypes: {
      DetailedAnswer: "ЗОТ РО",
      Addition: "ЗОТ Д",
    },
  },
};

export const getTypeByCode = (type: QuestionType, subtype: string) => {
  const group = QUESTION_LABELS[type];
  
  // Используем type casting (as any), так как subtype приходит как общая строка, 
  // но мы знаем, что ищем внутри конкретной группы
  const subtypeLabel = (group.subtypes as Record<string, string>)[subtype] || subtype;

  return {
    typeLabel: group.label,
    subtypeLabel: subtypeLabel
  };
};
