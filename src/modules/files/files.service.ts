import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../../database/entities';
import { FileEntityType, FileType } from '../../database/enums/core.enums';

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
}
