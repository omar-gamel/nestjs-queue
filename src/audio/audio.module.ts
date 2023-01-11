import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';
import { AudioProcessor } from './audio.processor';

@Module({
  controllers: [AudioController],
  providers: [AudioProcessor]
})
export class AudioModule {}
