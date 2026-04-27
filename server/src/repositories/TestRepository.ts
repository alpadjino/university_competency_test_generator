import { Test } from "../models/Tests.js";
import { Competencies } from "../models/Competencies.js";

interface TestWithCompetecies extends Test {
  competencies: Competencies[]
};

export class TestRepository {
  async findById(id: number): Promise<TestWithCompetecies | null> {
    return await Test.findByPk(id, {
      include: [{ model: Competencies, as: 'competencies' }]
    }) as TestWithCompetecies;
  }

  async attachCompetency(testId: number, competencyId: number): Promise<Test> {
    const test = await Test.findByPk(testId);
    if (!test) {
      throw new Error("Test not found");
    }

    const competencyExists = await Competencies.findByPk(competencyId);
    if (!competencyExists) {
      throw new Error("Competency not found");
    }

    await test.addCompetency(competencyId);

    return await test.reload({
      include: [{
        model: Competencies,
        as: 'competencies',
        through: { attributes: [] }
      }]
    }) as TestWithCompetecies;
  }

  async deleteCompetency(testId: number, competencyId: number) {
    const test = await this.findById(testId);

    if (!test) {
      throw new Error("Test not found");
    }

    await test.removeCompetency(competencyId);

    return await test.reload({
      include: [{
        model: Competencies,
        as: 'competencies',
        through: { attributes: [] }
      }]
    }) as TestWithCompetecies;
  }
};
