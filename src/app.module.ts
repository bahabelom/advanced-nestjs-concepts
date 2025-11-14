import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from './user/user.module';

@Module({
  imports: [

    CacheModule.register({
      ttl: 5000,
      max: 10,
    }),

    UserModule,

    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
