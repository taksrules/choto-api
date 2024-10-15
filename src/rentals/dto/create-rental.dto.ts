import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateRentalDto {
  @ApiProperty({ description: 'ID of the user renting the asset' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'ID of the asset being rented' })
  @IsInt()
  assetId: number;

  @ApiProperty({ description: 'Number of tokens to deduct for the rental' })
  @IsPositive()
  tokens: number;
}
