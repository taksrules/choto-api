import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum } from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  USER = 'USER',
}

export class AssignRoleDto {
  @ApiProperty({ description: 'ID of the user to assign a new role' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'The new role to assign to the user (ADMIN, AGENT, USER)' })
  @IsEnum(Role)
  role: Role;
}
