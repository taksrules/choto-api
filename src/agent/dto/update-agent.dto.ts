import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AgentLevel } from '@prisma/client';

export class UpdateAgentDto {
  @ApiPropertyOptional({ description: 'The updated address of the agent' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'The updated agent level (BASIC, STANDARD, MAX)' })
  @IsOptional()
  @IsEnum(AgentLevel)
  level?: AgentLevel;
}
