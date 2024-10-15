import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
    return this.assetService.registerAsset(registerAssetDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status of an asset (rented or available)' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async updateAssetStatus(@Param('id') id: number, @Body() updateAssetStatusDto: UpdateAssetStatusDto) {
    return this.assetService.updateAssetStatus(id, updateAssetStatusDto);
  }

  @Get(':id/assets')
  @ApiOperation({ summary: 'Retrieve all assets assigned to a particular agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async getAgentAssets(@Param('id') agentId: number) {
    return this.assetService.getAgentAssets(agentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve asset details including rental history' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async getAssetDetails(@Param('id') id: number) {
    return this.assetService.getAssetDetails(id);
  }

}
