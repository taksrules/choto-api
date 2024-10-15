import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt } from 'class-validator';
import { AssetType } from '@prisma/client'; // Assuming AssetType is an enum from your Prisma schema

export class RegisterAssetDto {
  @ApiProperty({ description: 'Name of the asset' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Type of the asset (POWERBANK, FREEZER, LAMP, FRIDGE)' })
  @IsEnum(AssetType)
  assetType: AssetType;

  @ApiProperty({ description: 'ID of the agent to whom the asset is assigned' })
  @IsInt()
  agentId: number;
}
