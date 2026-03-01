import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { EnrollmentFormsModule } from './modules/enrollment-forms/enrollment-forms.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { StudentsModule } from './modules/students/students.module';
import { AdminModule } from './modules/admin/admin.module';
import { TaModule } from './modules/ta/ta.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';

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

    AuthModule,
    CoursesModule,
    ProjectsModule,
    EnrollmentFormsModule,
    CertificatesModule,
    StudentsModule,
    AdminModule,
    TaModule,
    NotificationsModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
