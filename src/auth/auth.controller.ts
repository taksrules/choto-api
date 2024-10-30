import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorater';
import { User } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(@Body() createAuthDto: CreateAuthDto) {
    try {
      return await this.authService.create(createAuthDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'User registration failed. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      await this.authService.login(user, response);
      return { message: 'Login successful' };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Login failed. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() user: User) {
    try {
      return await this.authService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve users.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile details' })  
  async update(@CurrentUser() user: User, @Body() updateAuthDto: UpdateAuthDto) {
    try {
      return await this.authService.update(user.id, updateAuthDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to update user profile.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('rentals')
  @ApiOperation({ summary: 'Retrieve the rental history of a user' })
 
  @UseGuards(JwtAuthGuard)
  async getUserRentals(@CurrentUser() user: User) {
    try {
      return await this.authService.getUserRentals(user.id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve rental history.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Retrieve the transaction history of a user' }) 
  @UseGuards(JwtAuthGuard) // Ensures the user is authenticated
  async getUserTransactions(@CurrentUser() user: User) {
    try {
      return await this.authService.getUserTransactions(user.id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve transaction history.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

 

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.authService.remove(+id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Failed to remove user with ID ${id}.`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('verification-code')
  @UseGuards(JwtAuthGuard)
  async getVerificationCode(@CurrentUser() user: User) {
    try {
      return await this.authService.getVerificationCode(user.email);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve verification code.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('activate')
  async activate(@Body() body: { email: string; verificationCode: string }) {
    try {
      return await this.authService.activateUser(
        body.email,
        body.verificationCode,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to activate user. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getProfile(@CurrentUser() user: User) {
    try {
      return await this.authService.getUserById(user.id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve user profile.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('token-balance')
  @ApiOperation({ summary: 'Retrieve the current token balance of the user' }) 
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getTokenBalance(@CurrentUser() user: User) {
    try {
      return await this.authService.getTokenBalance(user.id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve token balance.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard) 
  async findOne(@CurrentUser() user: User) {
    try {
      return await this.authService.getUserById(user.id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `User with ID ${user.id} not found.`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
