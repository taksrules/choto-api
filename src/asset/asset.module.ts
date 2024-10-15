import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { PrismaModule } from 'common/prisma';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[PrismaModule,PassportModule,JwtModule],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
