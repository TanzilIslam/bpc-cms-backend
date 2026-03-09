import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  const corsOrigins = configService.get<string>('CORS_ORIGIN', '').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global validation pipe (fallback for non-Zod validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Programming Club CMS API')
      .setDescription('CMS Backend API for Programming Club')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('courses', 'Public and admin course endpoints')
      .addTag('projects', 'Project showcase endpoints')
      .addTag('enrollment-forms', 'Public enrollment form endpoints')
      .addTag('certificates', 'Certificate verification and generation')
      .addTag('students', 'Student self-service endpoints')
      .addTag('admin', 'Admin management endpoints')
      .addTag('ta', 'Teaching assistant endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Health check endpoint
  app.getHttpAdapter().get('/health', (_req: unknown, res: unknown) => {
    const response = res as {
      status: (code: number) => { json: (data: unknown) => void };
    };
    response.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const paddedEnv = nodeEnv.padEnd(43);
  const portStr = port.toString();

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 Programming Club CMS API is running!                    ║
║                                                               ║
║   📍 Environment: ${paddedEnv}║
║   🌐 URL:         http://localhost:${portStr.padEnd(31)}║
║   📚 API Docs:    http://localhost:${port}/api/docs${' '.repeat(18)}║
║   ❤️  Health:      http://localhost:${port}/health${' '.repeat(19)}║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

void bootstrap();
