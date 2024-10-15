import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from 'src/auth/strategies/local.strategy';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { PrismaModule } from 'common/prisma';

@Module({
  imports:[PrismaModule,PassportModule,JwtModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
