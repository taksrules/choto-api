import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { BoreholeService } from './borehole.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorater';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Borehole')
@Controller('borehole')
export class BoreholeController {
  constructor(private readonly boreholeService: BoreholeService) {}

  // Step 1: Generate purchase code for user
  @Post('purchase')
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  @ApiOperation({ summary: 'Generate a purchase code for borehole water' })
  async generatePurchaseCode(
    @CurrentUser() user, 
    @Body('boreholeId') boreholeId: number,
    @Body('amountLiters') amountLiters: number, 
  ) {
    try {
      return await this.boreholeService.generatePurchaseCode(user.id, boreholeId, amountLiters);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw known exceptions
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to generate purchase code. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Step 2: Agent generates the agent code
  @Post('agent-code')
  @UseGuards(JwtAuthGuard) // Ensure the agent is authenticated
  @ApiOperation({ summary: 'Generate an agent code after payment confirmation' })
  async generateAgentCode(@CurrentUser() agent, @Body('purchaseCode') purchaseCode: string) {
    try {
      return await this.boreholeService.generateAgentCode(agent.id, purchaseCode);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw known exceptions
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to generate agent code. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Step 3: Generate final token code for borehole meter
  @Post('token-code')
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  @ApiOperation({ summary: 'Generate a token code for borehole meter after agent confirmation' })
  async generateTokenCode(@Body('purchaseCode') purchaseCode: string, @Body('agentCode') agentCode: string) {
    try {
      return await this.boreholeService.generateTokenCode(purchaseCode, agentCode);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw known exceptions
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to generate token code. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
