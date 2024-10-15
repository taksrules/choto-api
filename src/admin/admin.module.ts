import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from 'common/prisma';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[PrismaModule,PassportModule,JwtModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
