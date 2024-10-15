import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'common/prisma';
import { CreateRentalDto } from './dto/create-rental.dto';

@Injectable()
export class RentalsService {
    constructor(private readonly prisma: PrismaService) {}

    async createRental(createRentalDto: CreateRentalDto) {
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
      }

      async returnRental(rentalId: number) {
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
      }

      async getActiveRentals() {
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
      }

      async getRentalById(rentalId: number) {
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
      }
}
