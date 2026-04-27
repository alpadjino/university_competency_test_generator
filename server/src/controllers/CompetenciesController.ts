import { Body, Controller, Get, Post, Route, Tags } from "tsoa";
import { CompetenciesResponse, CreateCompetenciesRequest } from "../views/Competencies";
import { Competencies } from "../models/Competencies";

@Route("competencies")
@Tags("Competencies")
export class CompetenciesController extends Controller {
  @Get("list")
  public async list(): Promise<CompetenciesResponse[]> {
    try {

      const competencies = await Competencies.findAll();
      
      this.setStatus(200);
      return competencies;
    }
    catch(error) {
      this.setStatus(500);
      return [];
    }
  };

  @Post("create")
  public async create(
    @Body() request: CreateCompetenciesRequest
  ): Promise<CompetenciesResponse> {
    const { name, description } = request;

    try {
      if (!name || !description) {
        this.setStatus(400);
        throw new Error("Имя и описание обязательны");
      }

      const competency = await Competencies.create({ name, description });

      this.setStatus(200);

      return competency;
    }
    catch (error) {
      this.setStatus(500);
      return { id: 0, description: "", name: "" };
    }
  }
}