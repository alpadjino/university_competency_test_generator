import { Body, Controller, Get, Patch, Path, Route, Tags } from "tsoa";
import { Question, QuestionOptionsDb } from '../models/Agent';
import { ClosedQuestionSubtype, OpenQuestionSubtype, QuestionCategory, QuestionType } from "../views/Agent";

export type QuestionsGeneratedResponse = {
  id: number;
  text: string;
  category: QuestionCategory;
  type: QuestionType;
  subtype: ClosedQuestionSubtype | OpenQuestionSubtype;
  options: QuestionOptionsDb;
  question: string;
  standardAnswer: string | null;
  testId: number;
};

export type QuestionsGeneratedListResponse = Array<QuestionsGeneratedResponse>;

@Route("tests/{testId}/questions")
@Tags("Questions")
export class QuestionsController extends Controller {

  @Get("list")
  public async list(
    @Path() testId: number
  ): Promise<QuestionsGeneratedListResponse> {
    try {
      const questions = await Question.findAll({
        where: { testId: testId }
      });

      this.setStatus(200);
      return questions as unknown as QuestionsGeneratedListResponse;
    }
    catch (error) {
      this.setStatus(500);
      throw new Error("Internal Server Error");
    }
  }

  @Patch('{questionId}/change-category')
  public async changeCategory(
    @Path() questionId: number,
    @Body() body: { category: QuestionCategory },
  ): Promise<QuestionsGeneratedResponse> {
    try {
      const question = await Question.findByPk(questionId);

      if (!question) {
        this.setStatus(404);
        throw new Error("Question not found");
      }

      await question.update({ category: body.category as any });

      this.setStatus(200);
      return question as unknown as QuestionsGeneratedResponse;
    }
    catch (error) {
      this.setStatus(500);
      throw error;
    }
  }

  @Patch('{questionId}/change-options')
  public async changeOptions(
    @Path() questionId: number,
    @Body() body: { options: QuestionOptionsDb },
  ): Promise<QuestionsGeneratedResponse> {
    try {
      const question = await Question.findByPk(questionId);

      if (!question) {
        this.setStatus(404);
        throw new Error("Question not found");
      }

      await question.update({ options: body.options });

      this.setStatus(200);
      return question as unknown as QuestionsGeneratedResponse;
    }
    catch (error) {
      this.setStatus(500);
      throw error;
    }
  }

  @Patch('{questionId}/change-question')
  public async changeQuestionText(
    @Path() questionId: number,
    @Body() body: { question: string },
  ): Promise<QuestionsGeneratedResponse> {
    try {
      const question = await Question.findByPk(questionId);

      if (!question) {
        this.setStatus(404);
        throw new Error("Question not found");
      }

      await question.update({ question: body.question });

      this.setStatus(200);
      return question as unknown as QuestionsGeneratedResponse;
    }
    catch (error) {
      this.setStatus(500);
      throw error;
    }
  }

  @Patch('{questionId}/change-standard-answer')
  public async changeStandardAnswer(
    @Path() questionId: number,
    @Body() body: { standardAnswer: string | null },
  ): Promise<QuestionsGeneratedResponse> {
    try {
      const question = await Question.findByPk(questionId);

      if (!question) {
        this.setStatus(404);
        throw new Error("Question not found");
      }

      await question.update({ standardAnswer: body.standardAnswer });

      this.setStatus(200);
      return question as unknown as QuestionsGeneratedResponse;
    }
    catch (error) {
      this.setStatus(500);
      throw error;
    }
  }
};
