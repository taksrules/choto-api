// create-fridge-rental.dto.ts
import { IsDate, IsInt, IsNotEmpty } from 'class-validator';

export class CreateFridgeRentalDto {
  @IsInt()
  userId: number;

  @IsInt()
  assetId: number;

  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  endDate: Date;
}
