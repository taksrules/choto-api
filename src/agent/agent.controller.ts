import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RegisterAgentDto } from './dto/register-agent';
import { VerifyUserDto } from './dto/very-user.dto';
import { DistributeTokensDto } from './dto/distribute-tokens.dto';

@ApiTags('agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  async create(@Body() createAgentDto: CreateAgentDto) {
    try {
      return await this.agentService.create(createAgentDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to create agent. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new agent with a PENDING status' })
  @UseGuards(JwtAuthGuard)
  async registerAgent(@Body() registerAgentDto: RegisterAgentDto) {
    try {
      return await this.agentService.registerAgent(registerAgentDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Agent registration failed. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve agent profile details, including assigned assets' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard)
  async getAgentProfile(@Param('id') id: number) {
    try {
      return await this.agentService.getAgentProfile(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Agent with ID ${id} not found.`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.agentService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve agents.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Retrieve the current balance and debt of the agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard)
  async getAgentBalance(@Param('id') id: number) {
    try {
      return await this.agentService.getAgentBalance(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Failed to retrieve balance for agent with ID ${id}.`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update agent profile details such as address or level' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard)
  async updateAgentProfile(@Param('id') id: number, @Body() updateAgentDto: UpdateAgentDto) {
    try {
      return await this.agentService.updateAgentProfile(id, updateAgentDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to update agent profile.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Retrieve payment history for the agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard)
  async getAgentPayments(@Param('id') id: number) {
    try {
      return await this.agentService.getAgentPayments(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Failed to retrieve payments for agent with ID ${id}.`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify-user')
  @ApiOperation({ summary: 'Verifies a user by their verification code and activates the user upon deposit payment' })
  @UseGuards(JwtAuthGuard)
  async verifyUser(@Body() verifyUserDto: VerifyUserDto) {
    try {
      return await this.agentService.verifyUser(verifyUserDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to verify user.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Retrieve transaction history for the agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard)
  async getAgentTransactions(@Param('id') id: number) {
    try {
      return await this.agentService.getAgentTransactions(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Failed to retrieve transactions for agent with ID ${id}.`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('distribute-ttokens')
  @ApiOperation({ summary: 'Distribute tokens to users for renting services using email' })
  @UseGuards(JwtAuthGuard)
  async distributeTokens(@Body() distributeTokensDto: DistributeTokensDto) {
    try {
      return await this.agentService.distributeTokens(distributeTokensDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to distribute tokens.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.agentService.remove(+id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Failed to remove agent with ID ${id}.`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
