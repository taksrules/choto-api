import { Body, Controller, Get, Param, Patch, Post, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateRentalDto } from './dto/create-rental.dto';
import { CreateFridgeRentalDto } from './dto/create-fridge-rental.dto';
import { UpdateRentalStatusDto } from './dto/update-rental-status.dto';

@ApiTags('rentals')
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new rental record when a user rents an asset' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async createRental(@Body() createRentalDto: CreateRentalDto) {
    try {
      return await this.rentalsService.createRental(createRentalDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to create rental. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Mark a rental as returned and update the rental record' })
  @ApiParam({ name: 'id', description: 'Rental ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async returnRental(@Param('id') rentalId: number) {
    try {
      return await this.rentalsService.returnRental(rentalId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to return the rental. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('active')
  @ApiOperation({ summary: 'Retrieve all active rentals in the system' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async getActiveRentals() {
    try {
      return await this.rentalsService.getActiveRentals();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve active rentals. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific rental record by ID' })
  @ApiParam({ name: 'id', description: 'Rental ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getRentalById(@Param('id') rentalId: number) {
    try {
      return await this.rentalsService.getRentalById(rentalId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Failed to retrieve rental with ID ${rentalId}.`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('fridge/book')
  @UseGuards(JwtAuthGuard)
  async bookFridge(@Body() createFridgeRentalDto: CreateFridgeRentalDto) {
    return this.rentalsService.bookFridge(createFridgeRentalDto);
  }

  @Patch('fridge/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approveFridgeRental(
    @Param('id') rentalId: number,
    @Body() updateRentalStatusDto: UpdateRentalStatusDto,
  ) {
    return this.rentalsService.approveFridgeRental(rentalId, updateRentalStatusDto);
  }
}
