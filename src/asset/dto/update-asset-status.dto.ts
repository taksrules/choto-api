import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAssetStatusDto {
  @ApiProperty({ description: 'New status of the asset (true for rented, false for available)' })
  @IsBoolean()
  rented: boolean;
}
