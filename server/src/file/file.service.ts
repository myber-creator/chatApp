import { BadRequestException, Injectable } from '@nestjs/common';
import * as uuid from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
  async saveFile(file: Express.Multer.File, category: string) {
    try {
      const filename = uuid.v4() + '.jpg';
      const filepath = path.resolve(__dirname, '..', `static/${category}`);
      if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath, { recursive: true });
      }

      fs.writeFileSync(path.join(filepath, filename), file.buffer);
      return `http://localhost:3000/${category}/${filename}`;
    } catch {
      throw new BadRequestException('Во время записи файла возникла ошибка!');
    }
  }
}
