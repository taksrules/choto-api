import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client'; // Assuming PaymentMethod is an enum in your Prisma schema

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID of the user making the payment' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'ID of the agent receiving the payment (optional if user pays)' })
  @IsInt()
  @IsOptional()
  agentId?: number;

  @ApiProperty({ description: 'Amount to be paid' })
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Payment method (Ecocash, Innbucks)' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
