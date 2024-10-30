import { Module } from '@nestjs/common';
import { BoreholeService } from './borehole.service';
import { BoreholeController } from './borehole.controller';
import { PrismaModule } from 'common/prisma';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[PrismaModule,PassportModule,JwtModule],
  controllers: [BoreholeController],
  providers: [BoreholeService],
})
export class BoreholeModule {}
