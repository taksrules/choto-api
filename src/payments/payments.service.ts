import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'common/prisma';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async makePayment(createPaymentDto: CreatePaymentDto) {
    const { userId, agentId, amount, method } = createPaymentDto;

    // Fetch the user making the payment
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the agent exists if an agentId is provided
    if (agentId) {
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
      });
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${agentId} not found`);
      }
    }

    // Simulate payment processing (e.g., via Ecocash, Innbucks)
    const paymentStatus = 'COMPLETED'; // Assuming the payment was successful

    // Create the payment record in the Payment table
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        agentId: agentId || null, // Only include agentId if provided
        amount,
        method,
        status: paymentStatus, // Payment status (e.g., PENDING, COMPLETED, FAILED)
      },
    });

    return {
      message: 'Payment processed successfully',
      payment,
    };
  }

  async getPaymentById(paymentId: number) {
    // Fetch the payment by its ID
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true, // Include user details
        agent: {
          include: {
            user: true, // Include the user details related to the agent
          },
        },
      },
    });

    // Check if the payment exists
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    // Return payment details
    return {
      id: payment.id,
      userId: payment.userId,
      userName: payment.user.name,
      agentId: payment.agentId || null,
      agentName: payment.agent ? payment.agent.user.name : null,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      proofOfPayment: payment.proofOfPayment || 'N/A',
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  async getTransactionById(transactionId: number) {
    // Fetch the transaction by its ID
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: true, // Include user details
        agent: {
          include: {
            user: true, // Include the user details related to the agent
          },
        }, // Include agent details (if applicable)
        asset: true, // Include asset details (if applicable)
      },
    });

    // Check if the transaction exists
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    // Return transaction details
    return {
      id: transaction.id,
      userId: transaction.userId,
      userName: transaction.user.name,
      agentId: transaction.agentId || null,
      agentName: transaction.agent ? transaction.agent.user.name : null,
      assetId: transaction.assetId || null,
      assetName: transaction.asset ? transaction.asset.name : null,
      transactionType: transaction.transactionType,
      amount: transaction.amount || 0,
      tokenAmount: transaction.tokenAmount || 0,
      transactionDate: transaction.transactionDate,
    };
  }

  async getUserPayments(userId: number) {
    // Check if the user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Fetch payments related to the user
    return await this.prisma.payment.findMany({
      where: { userId },
      include: {
        agent: {
          select: { id: true, user: { select: { name: true, email: true } } },
        },
      },
    });
  }
}
