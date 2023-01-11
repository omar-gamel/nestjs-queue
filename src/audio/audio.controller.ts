import { InjectQueue } from '@nestjs/bull';
import { Controller, Post } from '@nestjs/common';
import { Queue } from 'bull';

@Controller('audio')
export class AudioController {
  constructor(@InjectQueue('audio') private readonly audioQueue: Queue) {}

  @Post('transcode')
  async transcode() {
    await this.audioQueue.add(
      'transcode',
      { file: 'audio.mp3' },
      {
        delay: 2000,
        jobId: Math.floor(Math.random() * 100),
        attempts: 5,
        backoff: 90000
      }
    );
  }
}
