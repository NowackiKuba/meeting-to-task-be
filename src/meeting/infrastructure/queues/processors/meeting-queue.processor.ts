import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ProcessMeetingJobData } from '../types';
import { AIProviderFactory } from 'src/shared/ai/infrastructure/adapters/outbound/factory/ai-provider.factory';
import { ConfigService } from 'src/config/config.service';
import { IMeetingRepository } from 'src/meeting/domain/ports/meeting.repository.port';
import { ExtractedTask } from 'src/shared/ai/domain/ports/ai.service.port';
import { Inject, Logger } from '@nestjs/common';
import { Token } from 'src/constant';
import { ITaskRepository } from 'src/task/domain/ports/task.repository.port';
import {
  Task,
  TaskPriority,
  TaskStatus,
} from 'src/task/domain/entities/task.entity';
import { EXTRACTION_PROMPT } from 'src/shared/ai/domain/prompts/extraction-prompt';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { IUserRepository } from 'src/user/domain/ports/user.repository.port';
import {
  DeductCreditUseCase,
  RefundCreditUseCase,
} from 'src/credit/application/use-cases';
import { NotFoundError, ProcessingError } from 'src/errors';

@Processor('meeting-queue')
export class MeetingQueueConsumer extends WorkerHost {
  private readonly logger = new Logger(MeetingQueueConsumer.name);

  constructor(
    private readonly aiProviderFactory: AIProviderFactory,
    private readonly configService: ConfigService,
    @Inject(Token.MeetingRepository)
    private readonly meetingRepository: IMeetingRepository,
    @Inject(Token.TaskRepository)
    private readonly taskRepository: ITaskRepository,
    @Inject(Token.UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly deductCreditUseCase: DeductCreditUseCase,
    private readonly refundCreditUseCase: RefundCreditUseCase,
    private readonly orm: MikroORM,
  ) {
    super();
  }
  async process(job: Job<ProcessMeetingJobData>): Promise<any> {
    return await RequestContext.create(this.orm.em.fork(), async () => {
      this.logger.log(
        `Processing job: ${job.name} (ID: ${job.id}) for meeting: ${job.data.meetingId}`,
      );

      try {
        switch (job.name) {
          case 'process':
            return await this.handleProcess(job.data);
          case 're-process':
            this.logger.log(`Re-processing not implemented for job ${job.id}`);
            return;
          default:
            this.logger.warn(`Unknown job name: ${job.name} for job ${job.id}`);
            return;
        }
      } catch (error) {
        this.logger.error(
          `Error processing job ${job.id}: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    });
  }

  async handleProcess(data: ProcessMeetingJobData) {
    this.logger.log(
      `Starting processing for meeting ${data.meetingId} (userId: ${data.userId})`,
    );

    // Track if credit was deducted for this processing attempt
    let creditDeducted = false;

    const user = await this.userRepository.findById(data.userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Check and deduct credit before processing (1 meeting = 1 credit)
    try {
      this.logger.log(`Checking and deducting 1 credit for meeting processing...`);
      await this.deductCreditUseCase.handle(
        data.userId,
        1, // 1 credit per meeting
        'meeting_processing',
        data.meetingId, // referenceId = meeting ID
        `Credit deducted for processing meeting ${data.meetingId}`,
      );
      creditDeducted = true;
      this.logger.log(`Successfully deducted 1 credit for meeting ${data.meetingId}`);
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof ProcessingError) {
        this.logger.error(
          `Cannot process meeting ${data.meetingId}: ${error.message}`,
        );
        throw new ProcessingError(
          `Cannot process meeting: ${error.message}`,
          { meetingId: data.meetingId, userId: data.userId },
        );
      }
      // If it's a different error, log and rethrow
      this.logger.error(
        `Unexpected error while deducting credit for meeting ${data.meetingId}: ${error.message}`,
      );
      throw error;
    }

    const provider =
      (this.configService.get('AI_PROVIDER' as any).toLowerCase() as
        | 'openai'
        | 'anthropic') || 'openai';
    this.logger.log(`Using AI provider: ${provider}`);

    const aiService = this.aiProviderFactory.get(provider);

    if (!aiService) {
      this.logger.error(`AI provider "${provider}" is not available`);
      throw new Error(`AI provider "${provider}" is not available`);
    }

    this.logger.log(`Fetching meeting ${data.meetingId} from repository`);
    const meeting = await this.meetingRepository.getById(data.meetingId);

    if (!meeting) {
      this.logger.error(`Meeting ${data.meetingId} not found`);
      throw new Error('Meeting not found');
    }

    this.logger.log(
      `Meeting ${data.meetingId} found. Notes length: ${meeting.notes?.length ?? 0} characters`,
    );

    const prompt = EXTRACTION_PROMPT;

    if (!prompt) {
      this.logger.error('No extraction prompt provided');
      throw new Error('No extraction prompt provided.');
    }

    try {
      this.logger.log(
        `Sending meeting notes to AI service for task extraction...`,
      );

      // Retry logic for AI service calls (handles JSON parsing errors)
      let summary: ExtractedTask | null = null;
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Truncate very long meeting notes to reduce JSON parsing issues
          const meetingNotes = meeting.notes || '';
          const maxNotesLength = 15000; // ~3000-4000 tokens
          const truncatedNotes =
            meetingNotes.length > maxNotesLength
              ? meetingNotes.substring(0, maxNotesLength) +
                '\n\n[Note: Meeting notes truncated due to length]'
              : meetingNotes;

          if (attempt > 1) {
            this.logger.warn(
              `Retry attempt ${attempt}/${maxRetries} for meeting ${data.meetingId}`,
            );
          }

          summary = await aiService.responseFormatted<ExtractedTask>(prompt, {
            MEETING_NOTES: truncatedNotes,
            CURRENT_DATE: new Date().toString(),
          });

          // Validate that summary has tasks array
          if (!summary || !summary.tasks || !Array.isArray(summary.tasks)) {
            throw new Error(
              'Invalid response format: expected object with tasks array',
            );
          }

          break; // Success, exit retry loop
        } catch (error: any) {
          lastError = error;
          const isJsonError =
            error.message?.includes('JSON') ||
            error.message?.includes('parse') ||
            error.message?.includes('Unterminated');

          console.log('ERROR MESSAGE: ', error.message);
          if (isJsonError && attempt < maxRetries) {
            this.logger.warn(
              `JSON parsing error on attempt ${attempt}/${maxRetries}: ${error.message}. Retrying...`,
            );
            // Wait a bit before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
            continue;
          }

          throw error;
        }
      }

      if (!summary) {
        throw new Error(
          `Failed to get valid response after ${maxRetries} attempts: ${lastError?.message}`,
        );
      }

      this.logger.log(
        `AI extracted ${summary.tasks.length} task(s) from meeting ${data.meetingId}`,
      );

      console.log('SUMMARY:', JSON.stringify(summary, null, 2));

      this.logger.log(
        `Creating ${summary.tasks.length} task(s) in database...`,
      );
      await Promise.all(
        summary.tasks.map(async (t, index) => {
          // Parse and validate dueDate
          let dueDate: Date | null = null;
          const dueDateValue = t.due_date as any; // AI might return string or Date
          if (dueDateValue) {
            // Handle string 'null' or invalid values
            if (typeof dueDateValue === 'string') {
              const dateStr = dueDateValue.trim();
              if (dateStr.toLowerCase() === 'null' || dateStr === '') {
                dueDate = null;
              } else {
                try {
                  const parsedDate = new Date(dateStr);
                  // Check if date is valid
                  if (!isNaN(parsedDate.getTime())) {
                    dueDate = parsedDate;
                  } else {
                    this.logger.warn(
                      `Invalid due_date for task "${t.description}": ${dateStr}. Setting to null.`,
                    );
                    dueDate = null;
                  }
                } catch (error: any) {
                  this.logger.warn(
                    `Error parsing due_date for task "${t.description}": ${error.message}. Setting to null.`,
                  );
                  dueDate = null;
                }
              }
            } else if (dueDateValue instanceof Date) {
              // Already a Date object
              if (!isNaN(dueDateValue.getTime())) {
                dueDate = dueDateValue;
              } else {
                this.logger.warn(
                  `Invalid Date object for task "${t.description}". Setting to null.`,
                );
                dueDate = null;
              }
            }
          }

          const newTask = new Task({
            description: t.description,
            meetingId: data.meetingId,
            assignee: t.assignee || null,
            category: t.category || null,
            dueDate,
            isAiGenerated: true,
            status: TaskStatus.TODO,
            priority:
              t.priority === 'low'
                ? TaskPriority.LOW
                : t.priority === 'medium'
                  ? TaskPriority.MEDIUM
                  : t.priority === 'high'
                    ? TaskPriority.HIGH
                    : TaskPriority.MEDIUM,
            userId: data.userId,
          });
          await this.taskRepository.create(newTask);
          this.logger.debug(
            `Created task ${index + 1}/${summary.tasks.length}: "${t.description}"`,
          );
        }),
      );

      this.logger.log(
        `All tasks created successfully. Marking meeting as completed.`,
      );
      meeting.markCompleted();

      await this.meetingRepository.update(meeting);

      user.incrementMeetingsProcessed();

      await this.userRepository.update(user);
      this.logger.log(
        `Successfully processed meeting ${data.meetingId}. Created ${summary.tasks.length} task(s).`,
      );
      return { summary };
    } catch (error) {
      this.logger.error(
        `Error processing meeting ${data.meetingId}: ${error.message}`,
        error.stack,
      );

      // Refund credit if it was deducted and processing failed
      // creditDeducted is captured from outer scope via closure
      if (creditDeducted) {
        try {
          this.logger.log(
            `Refunding 1 credit for failed meeting ${data.meetingId}...`,
          );
          await this.refundCreditUseCase.handle(
            data.userId,
            1, // Refund 1 credit
            'meeting_processing_failed',
            data.meetingId, // referenceId = meeting ID
            `Credit refunded due to processing failure for meeting ${data.meetingId}`,
          );
          this.logger.log(
            `Successfully refunded 1 credit for failed meeting ${data.meetingId}`,
          );
        } catch (refundError: any) {
          // Log refund error but don't throw - we still want to mark meeting as failed
          // This is a critical error that should be investigated/manually handled
          this.logger.error(
            `CRITICAL: Failed to refund credit for meeting ${data.meetingId}: ${refundError.message}. User should be manually refunded.`,
            refundError.stack,
          );
        }
      }

      meeting.markFailed(error?.message ?? 'Error processing meeting');

      await this.meetingRepository.update(meeting);
      this.logger.error(
        `Meeting ${data.meetingId} marked as failed. Error: ${error.message}`,
      );
      throw new Error(`[MEETING PROCESSOR]: ${error}`);
    }
  }
}
