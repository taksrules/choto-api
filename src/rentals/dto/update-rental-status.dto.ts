import { IsEnum } from 'class-validator';

export class UpdateRentalStatusDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  status: string;
}