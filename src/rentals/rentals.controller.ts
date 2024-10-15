import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateRentalDto } from './dto/create-rental.dto';

@ApiTags('rentals')
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new rental record when a user rents an asset' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async createRental(@Body() createRentalDto: CreateRentalDto) {
    return this.rentalsService.createRental(createRentalDto);
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Mark a rental as returned and update the rental record' })
  @ApiParam({ name: 'id', description: 'Rental ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async returnRental(@Param('id') rentalId: number) {
    return this.rentalsService.returnRental(rentalId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Retrieve all active rentals in the system' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async getActiveRentals() {
    return this.rentalsService.getActiveRentals();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific rental record by ID' })
  @ApiParam({ name: 'id', description: 'Rental ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getRentalById(@Param('id') rentalId: number) {
    return this.rentalsService.getRentalById(rentalId);
  }

  
}
