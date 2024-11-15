import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../enums';

export class CreateAuthDto {
  @ApiProperty({ description: 'The name of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The phone number of the user' })
  // @IsPhoneNumber(null) // You can specify a country code if needed
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'The role of the user',
    enum: Role,
    default: Role.User,
  })
  @IsEnum(Role)
  @IsOptional()
  role: Role = Role.User;

  @ApiProperty({ description: 'The initial balance of the user', default: 0.0 })
  @IsNumber()
  @IsOptional()
  balance?: number = 0.0; // Default value
}
