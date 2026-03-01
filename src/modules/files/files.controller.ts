import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole, FileType } from '../../database/enums/core.enums';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';
import type { AuthUser } from '../../common/auth/auth-user.interface';
import type { Express } from 'express';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TA, UserRole.STUDENT)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${randomUUID()}${extname(file.originalname)}`;
          cb(null, unique);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'text/plain',
          'application/zip',
          'video/mp4',
        ];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  async uploadFile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UploadFileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Valid file is required');
    }

    const typeByMime: Record<string, FileType> = {
      'image/jpeg': FileType.IMAGE,
      'image/png': FileType.IMAGE,
      'image/gif': FileType.IMAGE,
      'application/pdf': FileType.PDF,
      'text/plain': FileType.OTHER,
      'application/zip': FileType.ZIP,
      'video/mp4': FileType.VIDEO,
    };
    const fileType = typeByMime[file.mimetype] || FileType.OTHER;

    return this.filesService.saveFileMetadata({
      uploadedBy: user.sub,
      fileName: file.originalname,
      filePath: file.path,
      fileType,
      fileSize: file.size,
      mimeType: file.mimetype,
      entityType: dto.entityType,
      entityId: dto.entityId,
      isPublic: dto.isPublic,
    });
  }
}
