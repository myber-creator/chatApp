import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/decorators/auth.decorator';
import { FileService } from './file.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('uploadAvatar')
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() dto: { type: string },
  ) {
    return await this.fileService.saveFile(file, dto.type);
  }
}
