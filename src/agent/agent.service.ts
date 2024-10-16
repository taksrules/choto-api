import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { RegisterAgentDto } from './dto/register-agent';
import { PrismaService } from 'common/prisma';
import { VerifyUserDto } from './dto/very-user.dto';
import { DistributeTokensDto } from './dto/distribute-tokens.dto';
import { Prisma, TransactionType } from '@prisma/client';

@Injectable()
export class AgentService {
  constructor(private readonly prisma: PrismaService) {}
  create(createAgentDto: CreateAgentDto) {
    return 'This action adds a new agent';
  }

  async registerAgent(registerAgentDto: RegisterAgentDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: registerAgentDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${registerAgentDto.userId} not found`,
      );
    }

    const existingAgent = await this.prisma.agent.findUnique({
      where: { userId: registerAgentDto.userId },
    });
    if (existingAgent) {
      throw new ConflictException('User is already registered as an agent');
    }

    const agent = await this.prisma.agent.create({
      data: {
        userId: registerAgentDto.userId,
        level: registerAgentDto.level,
        address: registerAgentDto.address,
        debt: 0.0,
        negativeBalance: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Prisma.AgentUncheckedCreateInput,
    });

    // Logic to notify the admin for approval can be added here (e.g., email, system notification)

    return agent;
  }

  async getAgentProfile(agentId: number) {
    // Fetch the agent with related data (assets, payments, etc.)
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        assets: true, // Include assets assigned to the agent
        payments: true, // Optionally include payments (if needed)
      },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }

    // Return agent profile details, including assets
    return {
      id: agent.id,
      userId: agent.userId,
      level: agent.level,
      address: agent.address,
      debt: agent.debt,
      negativeBalance: agent.negativeBalance,
      assets: agent.assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        assetType: asset.assetType,
        qrCode: asset.qrCode,
        rented: asset.rented,
      })),
      payments: agent.payments, // Optionally include payment history
    };
  }

  findAll() {
    return `This action returns all agent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} agent`;
  }

  async updateAgentProfile(agentId: number, updateAgentDto: UpdateAgentDto) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }

    // Update the agent's profile with the provided data
    const updatedAgent = await this.prisma.agent.update({
      where: { id: agentId },
      data: { ...updateAgentDto },
    });

    return updatedAgent;
  }

  async getAgentBalance(agentId: number) {
    // Fetch the agent by ID
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    // If agent does not exist, throw an exception
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }

    // Return the balance and debt of the agent
    return {
      balance: agent.negativeBalance ? 0 : agent.debt, // Balance is 0 if they have a negative balance
      debt: agent.debt,
      negativeBalance: agent.negativeBalance,
    };
  }

  async getAgentPayments(agentId: number) {
    // Ensure the agent exists
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }

    // Fetch all payment records related to the agent
    const payments = await this.prisma.payment.findMany({
      where: { agentId },
    });

    // Return payment history
    return payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      proofOfPayment: payment.proofOfPayment,
      createdAt: payment.createdAt,
    }));
  }

  async verifyUser(verifyUserDto: VerifyUserDto) {
    // Fetch the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: verifyUserDto.email },
    });

    // If user does not exist, throw an exception
    if (!user) {
      throw new NotFoundException(
        `User with email ${verifyUserDto.email} not found`,
      );
    }

    // Check if the user is in PENDING status
    if (user.status !== 'PENDING') {
      throw new UnauthorizedException('User is not in a pending status');
    }

    // Verify the provided verification code
    if (user.verificationCode !== verifyUserDto.verificationCode) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Check if the user has paid the deposit
    if (!user.depositPaid) {
      throw new UnauthorizedException('User has not paid the deposit');
    }

    // Activate the user by updating their status
    const updatedUser = await this.prisma.user.update({
      where: { email: verifyUserDto.email },
      data: {
        status: 'ACTIVE',
        verificationCode: null, // Clear the verification code after activation
        verificationCodeExpiresAt: null,
      },
    });

    return {
      message: 'User verified and activated successfully',
      user: updatedUser,
    };
  }

  async getAgentTransactions(agentId: number) {
    // Ensure the agent exists
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }

    // Fetch all transaction records related to the agent
    const transactions = await this.prisma.transaction.findMany({
      where: { agentId },
    });

    // Return transaction history
    return transactions.map((transaction) => ({
      id: transaction.id,
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      tokenAmount: transaction.tokenAmount,
      transactionDate: transaction.transactionDate,
    }));
  }

  async distributeTokens(distributeTokensDto: DistributeTokensDto) {
    const { agentId, email, tokens } = distributeTokensDto;

    // Fetch agent and user by their email from the database
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true },
    });
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Check if agent and user exist
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // Check if the agent has enough tokens to distribute
    if (agent.user.tokens < tokens) {
      throw new ConflictException(
        'Agent does not have enough tokens to distribute',
      );
    }

    // Deduct tokens from the agent's balance
    await this.prisma.user.update({
      where: { id: agent.userId },
      data: { tokens: agent.user.tokens - tokens },
    });

    // Add tokens to the user's balance
    await this.prisma.user.update({
      where: { email },
      data: { tokens: user.tokens + tokens },
    });

    await this.prisma.transaction.create({
      data: {
        agentId: agentId,
        userId: user.id,
        transactionType: TransactionType.RENT,
        tokenAmount: tokens,
        transactionDate: new Date(),
      } as Prisma.TransactionUncheckedCreateInput, // Explicitly tell Prisma to use UncheckedCreateInput
    });

    return {
      message: `Successfully distributed ${tokens} tokens to user with email ${email}`,
      agentBalance: agent.user.tokens - tokens,
      userBalance: user.tokens + tokens,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} agent`;
  }
}
