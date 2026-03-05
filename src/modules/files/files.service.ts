import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../../database/entities';
import { FileEntityType, FileType, UserRole } from '../../database/enums/core.enums';
import { unlink } from 'fs/promises';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  saveFileMetadata(input: {
    uploadedBy: string;
    fileName: string;
    filePath: string;
    fileType: FileType;
    fileSize: number;
    mimeType: string;
    entityType: FileEntityType;
    entityId: string;
    isPublic: boolean;
  }) {
    return this.fileRepo.save(
      this.fileRepo.create({
        uploadedBy: input.uploadedBy,
        fileName: input.fileName,
        filePath: input.filePath,
        fileType: input.fileType,
        fileSize: `${input.fileSize}`,
        mimeType: input.mimeType,
        entityType: input.entityType,
        entityId: input.entityId,
        isPublic: input.isPublic,
      }),
    );
  }

  async getFileById(id: string, actor: { sub: string; role: UserRole }) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const isAdmin =
      actor.role === UserRole.ADMIN || actor.role === UserRole.SUPER_ADMIN;
    const isOwner = file.uploadedBy === actor.sub;

    if (!file.isPublic && !isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have access to this file');
    }

    return file;
  }

  async deleteFileById(id: string, actor: { sub: string; role: UserRole }) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const isAdmin =
      actor.role === UserRole.ADMIN || actor.role === UserRole.SUPER_ADMIN;
    const isOwner = file.uploadedBy === actor.sub;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only owner or admin can delete this file');
    }

    await this.fileRepo.delete({ id: file.id });

    if (file.filePath) {
      try {
        await unlink(file.filePath);
      } catch {
        // File may already be absent; metadata is already deleted.
      }
    }

    return { message: 'File deleted successfully', id: file.id };
  }
}
