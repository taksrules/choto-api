import { Module } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { PrismaModule } from 'common/prisma';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[PrismaModule,PassportModule,JwtModule],
  controllers: [RentalsController],
  providers: [RentalsService],
})
export class RentalsModule {}
