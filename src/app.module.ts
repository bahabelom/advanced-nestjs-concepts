import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

const redisUrl = `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${Number(process.env.REDIS_PORT) || 6379}/${Number(process.env.REDIS_DB) || 0}`;

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisStore = new KeyvRedis(redisUrl, { namespace: '' });
        const keyvInstance = new Keyv({ store: redisStore, namespace: '' });
        return {
          stores: [keyvInstance],
          ttl: 300000, // 5 minutes
        };
      },
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
