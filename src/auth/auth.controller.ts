import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
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
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user:User,
    @Res({passthrough:true}) response:Response
  ){
    await this.authService.login(user,response)
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user:User) {
    console.log(user)
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile details' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async update(@Param('id') id: number, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto);
  }

  @Get(':id/rentals')
  @ApiOperation({ summary: 'Retrieve the rental history of a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @UseGuards(JwtAuthGuard) 
  async getUserRentals(@Param('id') id: number) {
    return this.authService.getUserRentals(id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Retrieve the transaction history of a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @UseGuards(JwtAuthGuard) // Ensures the user is authenticated
  async getUserTransactions(@Param('id') id: number) {
    return this.authService.getUserTransactions(id);
  }
  
  @Get(':id/token-balance')
  @ApiOperation({ summary: 'Retrieve the current token balance of the user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getTokenBalance(@Param('id') id: number) {
    return this.authService.getTokenBalance(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @Get('verification-code')
  @UseGuards(JwtAuthGuard) 
  async getVerificationCode(@CurrentUser() user: User) {
    return this.authService.getVerificationCode(user.email); 
  }

  @Patch('activate')
  async activate(@Body() body: { email: string; verificationCode: string }) {
    return this.authService.activateUser(body.email, body.verificationCode); 
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getUserById(user.id); // Pass the user's ID to the service
  }
}
