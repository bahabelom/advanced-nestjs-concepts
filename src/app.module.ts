import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from './user/user.module';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    // Redis Cache Configuration
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: 300, // 5 minutes in seconds (Redis uses seconds, not milliseconds)
      isGlobal: true,
      // Optional: Add password if your Redis requires authentication
      // password: process.env.REDIS_PASSWORD,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
