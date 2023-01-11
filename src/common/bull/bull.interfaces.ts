import { RedisClient } from 'ioredis/built/connectors/SentinelConnector/types';

/*
    Links:
        - https://docs.nestjs.com/techniques/queues#queues
        - https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue

    BullModule configuration object consist of the following properties:
      1- limiter: RateLimiter - Options to control the rate at which the queue's jobs are processed.
      2- redis: RedisOpts - Options to configure the Redis connection.
      3- prefix: string - Prefix for all queue keys. Optional.
      4- defaultJobOptions: JobOpts - Options to control the default settings for new jobs.
      5- createClient
      6- settings: AdvancedSettings - Advanced Queue configuration settings. These should usually not be changed.
*/
export interface QueueOptions {
  limiter?: RateLimiter;
  redis?: RedisOpts;
  prefix?: string; // prefix for all queue keys. { prefix = bull }
  defaultJobOptions?: JobOpts;
  createClient?: (type: CreateClientTypeEnum, redisOpts?: RedisOpts) => RedisClient;
  settings?: AdvancedSettings;
}

export enum CreateClientTypeEnum {
  client = 'client',
  subscriber = 'subscriber'
}

// ________________________[1]________________________

interface RateLimiter {
  max: number; // Max number of jobs processed
  duration: number; // per duration in milliseconds
  bounceBack: boolean; // When jobs get rate limited, they stay in the waiting queue and are not moved to the delayed queue. { bounceBack = false }
}

// ________________________[2]________________________

interface RedisOpts {
  port?: number; // { port = 6379 }
  host?: string; // { host = localhost }
  db?: number; // { db = 0 }
  password?: string;
}

// ________________________[4]________________________

interface JobOpts {
  /*
   - Optional priority value. ranges from 1 (highest priority) to MAX_INT  (lowest priority).
   - Note thatusing priorities has a slight impact on performance, so do not use it if not required.
  */
  priority: number;
  /*
   - An amount of miliseconds to wait until this job can be processed.
   - Note that for accurate delays, both  server and clients should have their clocks synchronized. [optional].
  */
  delay: number;

  attempts: number; // The total number of attempts to try the job until it completes.

  repeat: RepeatOpts; // Repeat job according to a cron specification.

  backoff: number | BackoffOpts; // Backoff setting for automatic retries if the job fails

  lifo: boolean; // if true, adds the job to the right of the queue instead of the left (default false)

  timeout: number; // The number of milliseconds after which the job should be fail with a timeout error [optional]
  /*
   - Override the job ID - by default, the job ID is a unique
   - integer, but you can use this setting to override it.
   - If you use this option, it is up to you to ensure the
   - jobId is unique. If you attempt to add a job with an id that
   - already exists, it will not be added.
  */
  jobId: number | string;
  /*
   - If true, removes the job when it successfully completes.
   - A number specified the amount of jobs to keep.
   - Default behavior is to keep the job in the completed set.
  */
  removeOnComplete: boolean | number;
  /*
   - If true, removes the job when it fails after all attempts. A number specified the amount of jobs to keep
   - Default behavior is to keep the job in the failed set.
  */
  removeOnFail: boolean | number;

  stackTraceLimit: number; // Limits the amount of stack trace lines that will be recorded in the stacktrace.
}

interface RepeatOpts {
  cron?: string; // Cron string
  tz?: string; // Timezone
  startDate?: Date | string | number; // Start date when the repeat job should start repeating (only with cron).
  endDate?: Date | string | number; // End date when the repeat job should stop repeating.
  limit?: number; // Number of times the job should repeat at max.
  every?: number; // Repeat every millis (cron setting cannot be used together with this setting.)
  count?: number; // The start value for the repeat iteration count.
}

interface BackoffOpts {
  type: string; // Backoff type, which can be either `fixed` or `exponential`. A custom backoff strategy can also be specified in `backoffStrategies` on the queue settings.
  delay: number; // Backoff delay, in milliseconds.
}

// ________________________[6]________________________
interface AdvancedSettings {
  lockDuration: number; // Key expiration time for job locks. { lockDuration = 30000 }
  lockRenewTime: number; // Interval on which to acquire the job lock. { lockRenewTime = 15000 }
  stalledInterval: number; // How often check for stalled jobs (use 0 for never checking). { stalledInterval = 30000 }
  maxStalledCount: number; // Max amount of times a stalled job will be re-processed. { maxStalledCount = 1 }
  guardInterval: number; // Poll interval for delayed jobs and added jobs. { guardInterval = 5000 }
  retryProcessDelay: number; // delay before processing next job in case of internal error. { retryProcessDelay = 5000 }
  backoffStrategies: {}; // A set of custom backoff strategies keyed by name.
  drainDelay: number; // A timeout for when the queue is in drained state (empty waiting for jobs). { drainDelay = 5 }
}
