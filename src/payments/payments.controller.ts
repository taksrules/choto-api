import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('make')
  @ApiOperation({ summary: 'Create a payment record when a user or agent makes a payment' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async makePayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.makePayment(createPaymentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific payment record by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @UseGuards(JwtAuthGuard) // Ensure the request is authenticated
  async getPaymentById(@Param('id') paymentId: number) {
    return this.paymentService.getPaymentById(paymentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getTransactionById(@Param('id') transactionId: number) {
    return this.paymentService.getTransactionById(transactionId);
  }
}
