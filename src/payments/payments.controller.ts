import { Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser } from 'src/auth/current-user.decorater';
import { User } from '@prisma/client';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('make')
  @ApiOperation({ summary: 'Create a payment record when a user or agent makes a payment' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async makePayment(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      return await this.paymentService.makePayment(createPaymentDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Payment creation failed. Please try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific payment record by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async getPaymentById(@Param('id') paymentId: number) {
    try {
      const payment = await this.paymentService.getPaymentById(paymentId);
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }
      return payment;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve payment record.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/transaction')
  @ApiOperation({ summary: 'Retrieve a specific transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getTransactionById(@Param('id') transactionId: number) {
    try {
      const transaction = await this.paymentService.getTransactionById(transactionId);
      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
      }
      return transaction;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve transaction record.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user')
  @ApiOperation({ summary: 'Retrieve all payments made by the authenticated user' })
  @UseGuards(JwtAuthGuard) // Ensures the user is authenticated
  async getUserPayments(@CurrentUser() user: User) {
    try {
      const payments = await this.paymentService.getUserPayments(user.id);
      if (!payments.length) {
        throw new NotFoundException(`No payments found for user`);
      }
      return payments;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve payments for the user.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
