import { Body, Controller, Delete, Get, Path, Post, Route, Tags } from "tsoa";
import { SetCompetenciesRequest, SetDescriptionRequest, SetTitleRequest, TestViewModel } from "../views/Tests";
import { Test } from "../models/Tests";
import { TestStatusEnum } from "../models/enums/TestStatus";
import { TestRepository } from "../repositories/TestRepository";
import { Question } from "../models/Agent";

@Route("tests")
@Tags("Tests")
export class TestsController extends Controller {
  private testRepository = new TestRepository();

  @Get("{testId}/get")
  public async get(
    @Path() testId: number
  ) {
    const test = await this.testRepository.findById(testId);

    if (!test) {
      this.setStatus(404);
      throw new Error("Тест не найден");
    }

    const json = test.toJSON();
    return json;

  }

  @Post("{testId}/set-title")
  public async setTitle(
    @Path() testId: number,
    @Body() body: SetTitleRequest
  ): Promise<TestViewModel> {
    const test = await Test.findByPk(testId);

    if (!test) {
      this.setStatus(404);
      throw new Error("Тест не найден");
    }

    await test.update({ name: body.title });
    const json = test.toJSON();

    return json;
  }

  @Post("{testId}/set-description")
  public async setDescription(
    @Path() testId: number,
    @Body() body: SetDescriptionRequest
  ): Promise<TestViewModel> {
    const test = await Test.findByPk(testId);

    if (!test) {
      this.setStatus(404);
      throw new Error("Тест не найден");
    }

    await test.update({ description: body.description });
    const json = test.toJSON();

    return json;
  }

  @Post("{testId}/add-competency")
  public async addCompetency(
    @Path() testId: number,
    @Body() body: SetCompetenciesRequest
  ): Promise<TestViewModel> {
    const test = await Test.findByPk(testId);

    if (!test) {
      this.setStatus(404);
      throw new Error("Тест не найден");
    }

    try {
      const updatedTest = await this.testRepository.attachCompetency(testId, body.competenciesId);
      return updatedTest.toJSON();
    }
    catch (err) {
      throw new Error((err as Error).message, (err as Error));
    }
  }

  @Post("{testId}/remove-competency")
  public async removeCompetency(
    @Path() testId: number,
    @Body() body: SetCompetenciesRequest
  ): Promise<TestViewModel> {
    const test = await Test.findByPk(testId);

    if (!test) {
      this.setStatus(404);
      throw new Error("Тест не найден");
    }

    try {
      const updatedTest = await this.testRepository.deleteCompetency(testId, body.competenciesId);
      return updatedTest.toJSON();
    }
    catch (err) {
      throw new Error((err as Error).message, (err as Error));
    }
  }

  @Post("create")
  public async create(): Promise<TestViewModel> {
    const test = await Test.create({
      name: "Заголовок",
      description: "Описание",
      status: TestStatusEnum.IN_PROGRESS,
      files: [],
    });
    const json = test.toJSON();

    this.setStatus(200);

    return json;
  }

  @Get("list")
  public async list(): Promise<TestViewModel[]> {
    return Test.findAll();
  }

  @Delete("{testId}/delete")
  public async delete(
    @Path() testId: number,
  ): Promise<void> {
    const test = await Test.findByPk(testId);

    if (!test) {
      this.setStatus(404);
      throw new Error("Тест не найден");
    }

    await test.setCompetencies([]);

    await Question.destroy({ where: { testId: testId } });

    await test.destroy();

    this.setStatus(204);
  }

  // @Post("upload-document")
  // public async uploadDocument() {
  //   const test = await Test.findByPk(body.testId);
  //   if (!test) {
  //     this.setStatus(404);
  //     throw new Error("Тест не найден");
  //   }

  //   try {
  //     // Обращаемся к модели
  //     const generatedQuestions = await generateQuestions(
  //       test.title,
  //       test.description || ""
  //     );

  //     // Массово сохраняем сгенерированные вопросы в БД
  //     const questionsToInsert = generatedQuestions.map(q => ({
  //       testId: test.id,
  //       text: q.text,
  //       options: q.options,
  //       correctAnswer: q.correctAnswer
  //     }));

  //     await Question.bulkCreate(questionsToInsert);

  //     // Переводим тест в рабочий статус
  //     test.status = 'ready';
  //     await test.save();

  //     // Возвращаем тест вместе с вопросами
  //     return await Test.findByPk(test.id, { include: ['questions'] }) as Test;

  //   } catch (error) {
  //     this.setStatus(500);
  //     throw new Error(`AI generation failed: ${(error as Error).message}`);
  //   }
  // }
}