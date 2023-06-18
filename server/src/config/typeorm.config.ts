import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get('PGHOST'),
  port: configService.get('PGPORT'),
  database: configService.get('PGDATABASE'),
  username: configService.get('PGUSER'),
  password: configService.get('PGPASSWORD'),
  autoLoadEntities: true,
  synchronize: true,
  url: configService.get('DATABASE_URL'),
});
