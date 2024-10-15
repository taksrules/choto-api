import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsEnum } from 'class-validator';
import { AgentLevel } from '@prisma/client'; 

export class RegisterAgentDto {
  @ApiProperty({ description: 'ID of the user who is registering as an agent' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'The agent level (BASIC, STANDARD, MAX)' })
  @IsEnum(AgentLevel)
  level: AgentLevel;

  @ApiProperty({ description: 'The address of the agent' })
  @IsString()
  address: string;
}
