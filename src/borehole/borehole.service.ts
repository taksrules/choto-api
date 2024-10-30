import { Injectable, NotFoundException, ConflictException, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'common/prisma';
import { v4 as uuidv4 } from 'uuid'; // For generating unique codes

@Injectable()
export class BoreholeService {
  constructor(private readonly prisma: PrismaService) {}

  // Step 1: Generate purchase code for the user
  async generatePurchaseCode(userId: number, boreholeId: number, amountLiters: number) {
    try {
      // Find the user
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
      // Find the borehole
      const borehole = await this.prisma.borehole.findUnique({
        where: { id: boreholeId },
      });
      if (!borehole) {
        throw new NotFoundException(`Borehole with ID ${boreholeId} not found`);
      }
  
      // Generate unique purchase code
      const purchaseCode = uuidv4();
  
      // Create the purchase record with the required amountLiters field
      const newPurchase = await this.prisma.purchase.create({
        data: {
          user: {
            connect: { id: userId }, // Connect the user relation
          },
          borehole: {
            connect: { id: boreholeId }, // Connect the borehole relation
          },
          purchaseCode,
          amountLiters, // Provide the required amount of liters for the purchase
          status: 'PENDING',
        },
      });
  
      return {
        message: 'Purchase code generated successfully',
        purchaseCode: newPurchase.purchaseCode,
      };
    } catch (error) {
      // Handle known Prisma exceptions
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          'Error while processing the purchase request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
  
      // Throw the error again for other types of exceptions
      throw error;
    }
  }
  
  
  

  // Step 2: Agent generates code after payment confirmation
  async generateAgentCode(agentId: number, purchaseCode: string) {
    // Check if the agent exists
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }
  
    // Find the purchase associated with the provided purchaseCode
    const purchase = await this.prisma.purchase.findUnique({ where: { purchaseCode } });
    if (!purchase) {
      throw new NotFoundException(`Purchase with code ${purchaseCode} not found`);
    }
  
    // Ensure the purchase is still pending
    if (purchase.status !== 'PENDING') {
      throw new ConflictException('This purchase has already been processed');
    }
  
    // Generate a unique agent code
    const agentCodeValue = uuidv4();
  
    // Create a new AgentCode and link it to the purchase
    const agentCode = await this.prisma.agentCode.create({
      data: {
        agentId,
        purchaseId: purchase.id,
        agentCode: agentCodeValue,
      },
    });
  
    // Update the purchase status to 'PAID'
    const updatedPurchase = await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: 'PAID', // Mark the purchase as paid
      },
    });
  
    return {
      message: 'Agent code generated successfully',
      agentCode: agentCode.agentCode, // Return the generated agent code
    };
  }
  

  // Step 3: Generate token code for borehole meter after agent confirms
  async generateTokenCode(purchaseCode: string, agentCode: string) {
    // Find the purchase associated with the provided purchaseCode
    const purchase = await this.prisma.purchase.findUnique({
      where: { purchaseCode },
      include: { agentCode: true }, // Include agentCode relation to compare
    });
  
    // Check if purchase exists
    if (!purchase) {
      throw new NotFoundException(`Purchase with code ${purchaseCode} not found`);
    }
  
    // Validate the agentCode
    if (purchase.agentCode?.agentCode !== agentCode) {
      throw new UnauthorizedException('Invalid agent code provided');
    }
  
    // Check if the purchase status is 'PAID'
    if (purchase.status !== 'PAID') {
      throw new ConflictException('Purchase is not marked as paid');
    }
  
    // Generate unique token code for the borehole meter
    const tokenCodeValue = uuidv4();
  
    // Create a new Token and link it to the purchase
    const token = await this.prisma.token.create({
      data: {
        purchaseId: purchase.id,
        tokenCode: tokenCodeValue,
      },
    });
  
    // Update the purchase status to 'COMPLETED'
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: 'COMPLETED', // Mark purchase as completed
      },
    });
  
    return {
      message: 'Token code generated successfully',
      tokenCode: token.tokenCode, // Return the generated token code
    };
  }
  
}
