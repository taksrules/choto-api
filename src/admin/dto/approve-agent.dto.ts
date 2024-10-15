import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ApproveAgentDto {
  @ApiProperty({ description: 'ID of the agent to be approved' })
  @IsInt()
  agentId: number;
}
