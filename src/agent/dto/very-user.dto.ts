import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class VerifyUserDto {
  @ApiProperty({ description: 'Email of the user to be verified' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Verification code provided by the user' })
  @IsString()
  verificationCode: string;
}
