import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
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
  findAll() {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly prisma: PrismaService) {}

  create(createAgentDto: CreateAgentDto) {
    return 'This action adds a new agent';
  }

  async registerAgent(registerAgentDto: RegisterAgentDto) {
    try {
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

      return agent;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to register agent. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAgentProfile(agentId: number) {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
        include: {
          assets: true,
          payments: true,
        },
      });

      if (!agent) {
        throw new NotFoundException(`Agent with ID ${agentId} not found`);
      }

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
        payments: agent.payments,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve agent profile. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAgentProfile(agentId: number, updateAgentDto: UpdateAgentDto) {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
      });
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${agentId} not found`);
      }

      const updatedAgent = await this.prisma.agent.update({
        where: { id: agentId },
        data: { ...updateAgentDto },
      });

      return updatedAgent;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to update agent profile. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAgentBalance(agentId: number) {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        throw new NotFoundException(`Agent with ID ${agentId} not found`);
      }

      return {
        balance: agent.negativeBalance ? 0 : agent.debt,
        debt: agent.debt,
        negativeBalance: agent.negativeBalance,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve agent balance. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAgentPayments(agentId: number) {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
      });
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${agentId} not found`);
      }

      const payments = await this.prisma.payment.findMany({
        where: { agentId },
      });

      return payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        proofOfPayment: payment.proofOfPayment,
        createdAt: payment.createdAt,
      }));
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve agent payments. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyUser(verifyUserDto: VerifyUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: verifyUserDto.email },
      });

      if (!user) {
        throw new NotFoundException(
          `User with email ${verifyUserDto.email} not found`,
        );
      }

      if (user.status !== 'PENDING') {
        throw new UnauthorizedException('User is not in a pending status');
      }

      if (user.verificationCode !== verifyUserDto.verificationCode) {
        throw new UnauthorizedException('Invalid verification code');
      }

      if (!user.depositPaid) {
        throw new UnauthorizedException('User has not paid the deposit');
      }

      const updatedUser = await this.prisma.user.update({
        where: { email: verifyUserDto.email },
        data: {
          status: 'ACTIVE',
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      });

      return {
        message: 'User verified and activated successfully',
        user: updatedUser,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to verify user. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAgentTransactions(agentId: number) {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
      });
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${agentId} not found`);
      }

      const transactions = await this.prisma.transaction.findMany({
        where: { agentId },
      });

      return transactions.map((transaction) => ({
        id: transaction.id,
        transactionType: transaction.transactionType,
        amount: transaction.amount,
        tokenAmount: transaction.tokenAmount,
        transactionDate: transaction.transactionDate,
      }));
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve agent transactions. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async distributeTokens(distributeTokensDto: DistributeTokensDto) {
    const { agentId, email, tokens } = distributeTokensDto;

    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
        include: { user: true },
      });
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!agent) {
        throw new NotFoundException(`Agent with ID ${agentId} not found`);
      }
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      if (agent.user.tokens < tokens) {
        throw new ConflictException(
          'Agent does not have enough tokens to distribute',
        );
      }

      await this.prisma.user.update({
        where: { id: agent.userId },
        data: { tokens: agent.user.tokens - tokens },
      });

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
        } as Prisma.TransactionUncheckedCreateInput,
      });

      return {
        message: `Successfully distributed ${tokens} tokens to user with email ${email}`,
        agentBalance: agent.user.tokens - tokens,
        userBalance: user.tokens + tokens,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to distribute tokens. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} agent`;
  }
}
