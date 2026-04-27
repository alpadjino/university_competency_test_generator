export interface SetTitleRequest {
  title: string;
}

export interface SetDescriptionRequest {
  description: string;
}

export interface OllamaQuestionFormat {
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface SetCompetenciesRequest {
  competenciesId: number;
}

export interface TestViewModel {
  id: number;
  name: string;
  description: string;
  status: string;
  files: string[];
}
