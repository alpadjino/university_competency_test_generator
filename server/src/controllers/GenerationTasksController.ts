import { Controller, Get, Path, Route, Tags } from 'tsoa';
import { GenerationTask } from '../models/GenerationTask';
import { GenerationStatus } from '../views/Agent';

export type GenerationTaskResponse = {
  id: number;
  questionId: number;
  testId: number;
  promptText: string;
  status: GenerationStatus;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GenerationTaskListResponse = GenerationTaskResponse[];

@Route('tests/{testId}/generation-tasks')
@Tags('GenerationTasks')
export class GenerationTasksController extends Controller {
  @Get('list')
  public async list(@Path() testId: number): Promise<GenerationTaskListResponse> {
    try {
      const tasks = await GenerationTask.findAll({
        where: { testId },
        order: [['createdAt', 'ASC']],
      });

      this.setStatus(200);
      return tasks as unknown as GenerationTaskListResponse;
    } catch {
      this.setStatus(500);
      throw new Error('Internal Server Error');
    }
  }
}
