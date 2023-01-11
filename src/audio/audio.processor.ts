import { InjectQueue, OnGlobalQueueActive, OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';

@Processor('audio')
export class AudioProcessor {
  constructor(@InjectQueue('audio') private readonly audioQueue: Queue) {}
  private readonly logger = new Logger(AudioProcessor.name);

  @Process('transcode')
  async handleTranscode(job: Job) {
    this.logger.debug('Start transcoding...');
    this.logger.debug(job.data);
    this.logger.debug('Transcoding completed');
    const input: any = job.data;
    return await this.process(input);
  }
  /*
   Local Event :
    - Is one that is produced when an action or state change is triggered on a queue in the local process.
    - In other words, when your event producers and consumers are local to a single process, all events happening on queues are local.
  */
  @OnQueueActive()
  async onQueueActive(job: Job) {
    console.log(job.id + '_______onQueueActive_______');
    const input: any = job?.data;
    if (input && !(await job?.finished())) await this.process(input);
  }
  /*
   Global Event :
    - When a queue is shared across multiple processes, we encounter the possibility of global events.
    - For a listener in one process to receive an event notification triggered by another process, it must register for a global event.
  */
  @OnGlobalQueueActive()
  async onGlobalQueueActive(jobId: string) {
    console.log(jobId + '_______onGlobalQueueActive_______');
    const job = await this.audioQueue.getJob(jobId);
    const input: any = job?.data;
    if (input && !(await job?.finished())) await this.process(input);
  }

  private async process(input) {
    try {
      console.log('>>>>>>>>>>>>>>>>', input);
    } catch (e) {
      console.log('Error -> ', e, 'audio');
    } finally {
      return true;
    }
  }
}
