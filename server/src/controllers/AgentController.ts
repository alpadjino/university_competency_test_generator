import { Body, Controller, Post, Route, Tags } from 'tsoa';
import { GenerateQuestionsRequest, GenerateQuestionsEnqueueResponse } from '../views/Agent';
import { QuestionEnqueueService, TestNotFoundError } from '../services/QuestionEnqueueService';

@Route("agent")
@Tags("Agent")
export class AgentController extends Controller {
  @Post("generate")
  public async generate(
    @Body() body: GenerateQuestionsRequest
  ): Promise<GenerateQuestionsEnqueueResponse> {
    try {
      const questionIds = await QuestionEnqueueService.enqueue(body);

      this.setStatus(202);
      return {
        questionIds,
        message: `${questionIds.length} вопросов добавлено в очередь генерации`,
      };
    } catch (error) {
      if (error instanceof TestNotFoundError) {
        this.setStatus(404);
        throw error;
      }
      console.error('Error in AgentController.generate:', error);
      this.setStatus(500);
      throw new Error('Internal Server Error during question generation enqueue');
    }
  }
};
