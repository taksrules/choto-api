import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsEmail } from 'class-validator';

export class DistributeTokensDto {
  @ApiProperty({ description: 'Email of the user receiving tokens' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'ID of the agent distributing tokens' })
  @IsInt()
  agentId: number;

  @ApiProperty({ description: 'Number of tokens to distribute' })
  @IsPositive()
  tokens: number;
}
