import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly configService: ConfigService) {}

  sendEmail(to: string, subject: string, content: string): Promise<void> {
    const from =
      this.configService.get<string>('MAIL_FROM') || 'no-reply@bpc.local';
    this.logger.log(
      `Email queued from=${from} to=${to} subject="${subject}" content="${content}"`,
    );
    return Promise.resolve();
  }
}
