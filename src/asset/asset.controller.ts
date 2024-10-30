import { Controller, Get, Post, Body, Patch, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RegisterAssetDto } from './dto/register-asset.to';
import { UpdateAssetStatusDto } from './dto/update-asset-status.dto';

@ApiTags('assets')
@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new asset in the system' })
  @UseGuards(JwtAuthGuard) // Ensure the agent or admin is authenticated
  async registerAsset(@Body() registerAssetDto: RegisterAssetDto) {
    try {
      return await this.assetService.registerAsset(registerAssetDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to register asset. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status of an asset (rented or available)' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async updateAssetStatus(@Param('id') id: number, @Body() updateAssetStatusDto: UpdateAssetStatusDto) {
    try {
      return await this.assetService.updateAssetStatus(id, updateAssetStatusDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to update asset status. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/assets')
  @ApiOperation({ summary: 'Retrieve all assets assigned to a particular agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async getAgentAssets(@Param('id') agentId: number) {
    try {
      return await this.assetService.getAgentAssets(agentId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve agent assets. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve asset details including rental history' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async getAssetDetails(@Param('id') id: number) {
    try {
      return await this.assetService.getAssetDetails(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve asset details. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':qrCode')
  @ApiOperation({ summary: 'Retrieve asset details by QR code' })
  @ApiParam({ name: 'qrCode', description: 'Asset QR Code' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async verifyAsset(@Param('qrCode') qrCode: string) {
    try {
      return await this.assetService.verifyAsset(qrCode);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to verify asset. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
