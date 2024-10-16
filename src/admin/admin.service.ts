import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'common/prisma';
import { ApproveAgentDto } from './dto/approve-agent.dto';
import { AssignRoleDto, Role } from './dto/role-assignment.dto';
import { Prisma, TransactionType } from '@prisma/client';

interface PaginationParams {
  page: number;
  limit: number;
}


@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
  
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  async approveAgent(approveAgentDto: ApproveAgentDto) {
    const { agentId } = approveAgentDto;

    // Fetch the agent from the database
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true },
    });

    // Check if the agent exists and is in PENDING status
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }
    if (agent.user.status !== 'PENDING') {
      throw new ConflictException('Agent is not in PENDING status');
    }

    // Allocate initial tokens based on agent level
    let initialTokens = 0;
    switch (agent.level) {
      case 'BASIC':
        initialTokens = 100;
        break;
      case 'STANDARD':
        initialTokens = 200;
        break;
      case 'MAX':
        initialTokens = 300;
        break;
      default:
        throw new ConflictException('Invalid agent level');
    }

    // Update the agent's status to ACTIVE and allocate tokens
    await this.prisma.user.update({
      where: { id: agent.userId },
      data: {
        status: 'ACTIVE',
        tokens: { increment: initialTokens },
      },
    });

    // Record the token allocation as a transaction
    await this.prisma.transaction.create({
      data: {
        agentId: agentId,            // Directly assign the agentId
        userId: agent.userId,        // Directly assign the userId
        transactionType: TransactionType.RENT,
        tokenAmount: initialTokens,
        transactionDate: new Date(),
      } as Prisma.TransactionUncheckedCreateInput,  // Explicitly use UncheckedCreateInput
    });
    

    return {
      message: `Agent with ID ${agentId} has been approved and allocated ${initialTokens} tokens.`,
      agentStatus: 'ACTIVE',
      allocatedTokens: initialTokens,
    };
  }

  async getAllUsers({ page, limit }: PaginationParams) {
    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    // Fetch total count of users
    const totalUsers = await this.prisma.user.count();

    
    const users = await this.prisma.user.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }, // Optional: Order by creation date
    });

    return {
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    };
  }

  async getAllAgents({ page, limit }: PaginationParams) {
    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    // Fetch total count of agents
    const totalAgents = await this.prisma.agent.count();

    // Fetch paginated agents
    const agents = await this.prisma.agent.findMany({
      skip: offset,
      take: limit,
      include: { user: true }, // Include user details like status
      orderBy: { createdAt: 'desc' }, // Optional: Order by creation date
    });

    // Map the agents with relevant details including user status
    const agentDetails = agents.map(agent => ({
      id: agent.id,
      userId: agent.userId,
      name: agent.user.name,
      email: agent.user.email,
      level: agent.level,
      address: agent.address,
      status: agent.user.status, // Agent's status (PENDING, ACTIVE)
      debt: agent.debt,
      negativeBalance: agent.negativeBalance,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }));

    return {
      totalAgents,
      currentPage: page,
      totalPages: Math.ceil(totalAgents / limit),
      agents: agentDetails,
    };
  }

  async assignRole(assignRoleDto: AssignRoleDto) {
    const { userId, role } = assignRoleDto;

    // Fetch the user from the database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Check if the user exists
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the role is different from the current role
    if (user.role === role) {
      throw new ConflictException(`User already has the role ${role}`);
    }

    // Validate eligibility for role change (you can add custom logic here)
    if (role === Role.AGENT) {
      // Example: Ensure the user meets certain criteria to become an agent
      if (user.status !== 'ACTIVE') {
        throw new ConflictException('User must be active to become an agent');
      }
    }

    // Update the user's role in the database
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return {
      message: `User with ID ${userId} has been assigned the role ${role}`,
      updatedUser,
    };
  }

  async getOverview() {
    // Fetch total number of users
    const totalUsers = await this.prisma.user.count();

    // Fetch total number of agents
    const totalAgents = await this.prisma.agent.count();

    // Fetch total number of active rentals
    const totalActiveRentals = await this.prisma.rental.count({
      where: {
        returnDate: null, // Active rentals have no return date
      },
    });

    // Fetch total number of transactions
    const totalTransactions = await this.prisma.transaction.count();

    // Fetch total number of active users (users with status ACTIVE)
    const totalActiveUsers = await this.prisma.user.count({
      where: {
        status: 'ACTIVE',
      },
    });

    // Fetch total number of pending agents
    const totalPendingAgents = await this.prisma.agent.count({
      where: {
        user: {
          status: 'PENDING',
        },
      },
    });

    // Return the aggregated statistics
    return {
      totalUsers,
      totalAgents,
      totalActiveUsers,
      totalPendingAgents,
      totalActiveRentals,
      totalTransactions,
    };
  }
}
