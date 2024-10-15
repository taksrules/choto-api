import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'common/prisma';
import { RegisterAssetDto } from './dto/register-asset.to';
import { v4 as uuidv4 } from 'uuid';
import { UpdateAssetStatusDto } from './dto/update-asset-status.dto';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  async registerAsset(registerAssetDto: RegisterAssetDto) {
    const { name, assetType, agentId } = registerAssetDto;

    // Ensure the agent exists
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }

    // Generate a unique QR code for the asset
    const qrCode = uuidv4(); // You can also use a custom QR code generation logic

    // Save the asset in the Asset table
    const asset = await this.prisma.asset.create({
      data: {
        name,
        assetType,
        qrCode,
        agentId,
      },
    });

    return {
      message: 'Asset registered successfully',
      asset,
    };
  }

  async getAssetDetails(assetId: number) {
    // Fetch the asset by its ID, including related data
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        agent: {
          include: {
            user: true, // Include the agent's user details
          },
        },
        Rental: true, // Include rental history of the asset
      },
    });

    // If the asset doesn't exist, throw an exception
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Return asset details including rental history
    return {
      id: asset.id,
      name: asset.name,
      assetType: asset.assetType,
      qrCode: asset.qrCode,
      status: asset.rented ? 'Rented' : 'Available',
      agent: {
        id: asset.agent.id,
        name: asset.agent.user.name,
        email: asset.agent.user.email,
      },
      rentalHistory: asset.Rental.map(rental => ({
        userId: rental.userId,
        rentalDate: rental.rentalDate,
        returnDate: rental.returnDate,
      })),
    };
  }

  async getAgentAssets(agentId: number) {
    // Check if the agent exists
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }

    // Fetch all assets assigned to the agent
    const assets = await this.prisma.asset.findMany({
      where: { agentId },
    });

    // Return the list of assets with their details
    return assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      assetType: asset.assetType,
      qrCode: asset.qrCode,
      status: asset.rented ? 'Rented' : 'Available',
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    }));
  }

  async updateAssetStatus(assetId: number, updateAssetStatusDto: UpdateAssetStatusDto) {
    const { rented } = updateAssetStatusDto;

    // Fetch the asset by its ID
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    // Check if the asset exists
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Check if the current status matches the intended status
    if (asset.rented === rented) {
      throw new ConflictException('The asset is already in the intended status');
    }

    // Update the asset's status in the database
    const updatedAsset = await this.prisma.asset.update({
      where: { id: assetId },
      data: { rented },
    });

    return {
      message: `Asset status updated successfully`,
      asset: updatedAsset,
    };
  }

  
  
}


