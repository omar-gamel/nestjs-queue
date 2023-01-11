import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestBullModule } from './common/bull/bull.module';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), NestBullModule, AudioModule]
})
export class AppModule {}
