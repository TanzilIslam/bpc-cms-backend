import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Fix for crypto not defined in Node 18 with TypeORM
// TypeORM requires crypto.randomUUID which may not be available in some Node 18 environments
import { webcrypto } from 'crypto';
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: false,
    configurable: true,
  });
}

@Module({
  imports: [
    // Configuration
    ConfigModule,

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getTypeOrmConfig(configService),
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60) * 1000, // milliseconds
          limit: configService.get<number>('THROTTLE_LIMIT', 10),
        },
      ],
    }),

    // Feature modules will be added here
    // AuthModule,
    // UsersModule,
    // RolesModule,
    // PermissionsModule,
    // FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
