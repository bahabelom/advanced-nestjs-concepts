import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from './user/user.module';
import KeyvRedis from '@keyv/redis';
import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');
const redisDb = parseInt(process.env.REDIS_DB || '0'); // Default to database 0
// Connection URL without password (since Redis Insight doesn't use password)
const redisUrl = `redis://${redisHost}:${redisPort}/${redisDb}`;

// Create Redis store instance
export const redisStoreInstance = new KeyvRedis(redisUrl, {
  // Remove namespace prefix so keys appear directly in Redis
  // Keys will be: users:all, user:1, etc. instead of keyv:users:all
  namespace: '',
});

// Log connection info for debugging
console.log(`Redis connection: ${redisUrl}`);
console.log(`Redis store namespace: '' (empty)`);

// Helper function to list all keys in Redis for debugging
// Create a separate connection just for listing keys
export async function listRedisKeys() {
  try {
    const debugClient = new Redis({
      host: redisHost,
      port: redisPort,
      db: redisDb,
    });
    
    const allKeys = await debugClient.keys('*');
    await debugClient.quit();
    
    return allKeys;
  } catch (error) {
    console.error('Error listing Redis keys:', error);
    return [];
  }
}

@Module({
  imports: [
    // Redis Cache Configuration
    CacheModule.register({
      store: redisStoreInstance,
      namespace: '', // Also set namespace in CacheModule
      ttl: 300000, // 5 minutes in milliseconds (cache-manager v7 uses milliseconds)
      isGlobal: true,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
