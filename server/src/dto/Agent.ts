import {
  ClosedQuestionSubtype as ClosedQuestionSubtypeModel,
  OpenQuestionSubtype as OpenQuestionSubtypeModel,
} from "../models/enums/Agent";
import {
  ClosedQuestionSubtype as ClosedQuestionSubtypeView,
  OpenQuestionSubtype as OpenQuestionSubtypeView
} from "../views/Agent";

// Объединяем все возможные строковые литералы из View
export type QuestionSubtypeView = ClosedQuestionSubtypeView | OpenQuestionSubtypeView;

// Объединяем все Enum значения
export type QuestionSubtypeEnum = ClosedQuestionSubtypeModel | OpenQuestionSubtypeModel;

/**
 * Маппер для преобразования строки (View) в значение Enum
 */
export const QuestionSubtypeMapper = {
  // Из строки во внутренний Enum
  toEnum(viewValue: QuestionSubtypeView): QuestionSubtypeEnum {
    const a = Object.values(ClosedQuestionSubtypeModel).find((v) => v === viewValue);
    const b = Object.values(OpenQuestionSubtypeModel).find((v) => v === viewValue);

    const result = a || b;

    if (!result) {
      throw new Error("Передан неправильный формат");
    }

    return result as QuestionSubtypeEnum;
  },

  // Проверка: является ли подтип "Закрытым"
  isClosed(subtype: QuestionSubtypeView): boolean {
    return !!Object.values(ClosedQuestionSubtypeModel).find((v) => v === subtype);
  },

  // Проверка: является ли подтип "Открытым"
  isOpen(subtype: QuestionSubtypeView): boolean {
    return !!Object.values(OpenQuestionSubtypeModel).find((v) => v === subtype);
  }
};