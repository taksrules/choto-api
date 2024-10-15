import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'common/prisma';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AgentModule } from './agent/agent.module';
import { AssetModule } from './asset/asset.module';
import { RentalsModule } from './rentals/rentals.module';
import { PaymentsModule } from './payments/payments.module';
import * as Joi from 'joi';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: Joi.object({
      DATABASE_URL: Joi.string().required(),
      PORT: Joi.number().required(),
    }),
    envFilePath: './apps/users/.env',
  }),
  PrismaModule,
  AuthModule,
  AdminModule,
  AgentModule,
  AssetModule,
  RentalsModule,
  PaymentsModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
