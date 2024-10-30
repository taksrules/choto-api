import { ConflictException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'common/prisma';
import { CreateRentalDto } from './dto/create-rental.dto';
import { CreateFridgeRentalDto } from './dto/create-fridge-rental.dto';
import { UpdateRentalStatusDto } from './dto/update-rental-status.dto';

@Injectable()
export class RentalsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRental(createRentalDto: CreateRentalDto) {
    try {
      const { userId, assetId, tokens } = createRentalDto;

      // Fetch the user and asset from the database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      const asset = await this.prisma.asset.findUnique({
        where: { id: assetId },
      });

      // Check if user and asset exist
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      // Check if the asset is available for rent
      if (asset.rented) {
        throw new ConflictException('Asset is already rented');
      }

      // Check if the user has enough tokens
      if (user.tokens < tokens) {
        throw new ConflictException('User does not have enough tokens for this rental');
      }

      // Deduct tokens from the user's account
      await this.prisma.user.update({
        where: { id: userId },
        data: { tokens: { decrement: tokens } },
      });

      // Mark the asset as rented
      await this.prisma.asset.update({
        where: { id: assetId },
        data: { rented: true },
      });

      // Create the rental record
      const rental = await this.prisma.rental.create({
        data: {
          userId,
          assetId,
          tokens,
          rentalDate: new Date(),
        },
      });

      return {
        message: 'Rental created successfully',
        rental,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create rental');
    }
  }

  async returnRental(rentalId: number) {
    try {
      // Fetch the rental from the database
      const rental = await this.prisma.rental.findUnique({
        where: { id: rentalId },
        include: { asset: true },
      });

      // Check if the rental exists
      if (!rental) {
        throw new NotFoundException(`Rental with ID ${rentalId} not found`);
      }

      // Check if the rental has already been returned
      if (rental.returnDate) {
        throw new ConflictException('Rental has already been returned');
      }

      // Update the return date for the rental
      const updatedRental = await this.prisma.rental.update({
        where: { id: rentalId },
        data: { returnDate: new Date() },
      });

      // Mark the asset as available
      await this.prisma.asset.update({
        where: { id: rental.assetId },
        data: { rented: false },
      });

      return {
        message: 'Rental returned successfully',
        rental: updatedRental,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to return rental');
    }
  }

  async getActiveRentals() {
    try {
      // Fetch all rentals where returnDate is null (active rentals)
      const activeRentals = await this.prisma.rental.findMany({
        where: { returnDate: null },
        include: {
          user: true,  // Include user details
          asset: true, // Include asset details
        },
      });

      // Return the list of active rentals with relevant details
      return activeRentals.map(rental => ({
        id: rental.id,
        userId: rental.userId,
        userName: rental.user.name,
        assetId: rental.assetId,
        assetName: rental.asset.name,
        rentalDate: rental.rentalDate,
        tokens: rental.tokens,
      }));
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve active rentals');
    }
  }

  async getRentalById(rentalId: number) {
    try {
      // Fetch the rental by its ID, including related asset information
      const rental = await this.prisma.rental.findUnique({
        where: { id: rentalId },
        include: {
          asset: true, // Include asset details
          user: true,  // Include user details
        },
      });

      // Check if the rental exists
      if (!rental) {
        throw new NotFoundException(`Rental with ID ${rentalId} not found`);
      }

      // Return rental details
      return {
        id: rental.id,
        userId: rental.userId,
        userName: rental.user.name,
        assetId: rental.assetId,
        assetName: rental.asset.name,
        rentalDate: rental.rentalDate,
        returnDate: rental.returnDate,
        tokens: rental.tokens,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve rental details');
    }
  }

  async bookFridge(createFridgeRentalDto: CreateFridgeRentalDto) {
    const { userId, assetId, startDate, endDate } = createFridgeRentalDto;

    // Ensure the asset is a fridge and is available
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.assetType !== 'FRIDGE') {
      throw new NotFoundException('Fridge not found or unavailable.');
    }

    if (asset.rented) {
      throw new ConflictException('Fridge is already rented.');
    }

    // Create the rental record without tokens
    const rental = await this.prisma.rental.create({
      data: {
        userId,
        assetId,
        rentalDate: startDate,
        returnDate: endDate,
      },
    });

    return {
      message: 'Fridge rental booked successfully. Please pay the agent in cash.',
      rental,
    };
  }

  async approveFridgeRental(rentalId: number, updateRentalStatusDto: UpdateRentalStatusDto) {
    const { status } = updateRentalStatusDto;

    const rental = await this.prisma.rental.findUnique({
      where: { id: rentalId },
      include: { asset: true },
    });

    if (!rental || rental.asset.assetType !== 'FRIDGE') {
      throw new NotFoundException('Fridge rental not found.');
    }

    // Approve the rental by updating its status
    await this.prisma.asset.update({
      where: { id: rental.assetId },
      data: { rented: status === 'APPROVED' },
    });

    return {
      message: `Fridge rental ${status.toLowerCase()} successfully.`,
    };
  }
}
