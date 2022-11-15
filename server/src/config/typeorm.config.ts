import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get<string>('HOST'),
  port: configService.get<number>('PORT'),
  database: configService.get<string>('DATABASE'),
  username: configService.get<string>('USER'),
  password: '1122334455',
  autoLoadEntities: true,
  synchronize: true,
});
