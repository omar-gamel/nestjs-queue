import IORedis from 'ioredis';
import { BullModule } from '@nestjs/bull';
import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { Response } from 'express';
import { QueueUIProvider } from './bull-board.provider';
import { env } from 'src/common/utils/env';
import { CreateClientTypeEnum } from './bull.interfaces';

const connectionOptions = {
    host: env.REDIS_HOST,
    port: +env.REDIS_PORT,
    password: env.REDIS_PASS,
    ...(env.REDIS_DATABASE_INEDX !== undefined && { db: +env.REDIS_DATABASE_INEDX }),
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  },
  client = new IORedis(connectionOptions),
  subscriber = new IORedis(connectionOptions);

// Queue(queueName: string, url?: string, opts?: QueueOptions): Queue

const queues = [BullModule.registerQueue({ name: 'audio' })];

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async () => ({
        createClient(type: CreateClientTypeEnum) {
          switch (type) {
            case CreateClientTypeEnum.client:
              return client;
            case CreateClientTypeEnum.subscriber:
              return subscriber;
            default:
              return new IORedis(connectionOptions);
          }
        },
        defaultJobOptions: { removeOnComplete: true, removeOnFail: true }
      })
    }),
    ...queues
  ],
  providers: [QueueUIProvider],
  exports: [...queues]
})
export class NestBullModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply((_, res: Response, next: any) => {
        if (env.NODE_ENV === 'production') return res.sendStatus(401);
        next();
      }, QueueUIProvider.router)
      .forRoutes('/admin/queues');
  }
}
