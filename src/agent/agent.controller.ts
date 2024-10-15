import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentService.create(createAgentDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new agent with a PENDING status' })
  @UseGuards(JwtAuthGuard)
  async registerAgent(@Body() registerAgentDto: RegisterAgentDto) {
    return this.agentService.registerAgent(registerAgentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve agent profile details, including assigned assets' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getAgentProfile(@Param('id') id: number) {
    return this.agentService.getAgentProfile(id);
  }

  @Get()
  findAll() {
    return this.agentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentService.findOne(+id);
  }
  @Get(':id/balance')
  @ApiOperation({ summary: 'Retrieve the current balance and debt of the agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getAgentBalance(@Param('id') id: number) {
    return this.agentService.getAgentBalance(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update agent profile details such as address or level' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async updateAgentProfile(@Param('id') id: number, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentService.updateAgentProfile(id, updateAgentDto);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Retrieve payment history for the agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  async getAgentPayments(@Param('id') id: number) {
    return this.agentService.getAgentPayments(id);
  }

  @Post('verify-user')
  @ApiOperation({ summary: 'Verifies a user by their verification code and activates the user upon deposit payment' })
  @UseGuards(JwtAuthGuard) // Ensure the agent is authenticated
  async verifyUser(@Body() verifyUserDto: VerifyUserDto) {
    return this.agentService.verifyUser(verifyUserDto);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Retrieve transaction history for the agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @UseGuards(JwtAuthGuard) // Ensure the agent is authenticated
  async getAgentTransactions(@Param('id') id: number) {
    return this.agentService.getAgentTransactions(id);
  }

  @Post('distribute-tokens')
  @ApiOperation({ summary: 'Distribute tokens to users for renting services using email' })
  @UseGuards(JwtAuthGuard) // Ensure the agent is authenticated
  async distributeTokens(@Body() distributeTokensDto: DistributeTokensDto) {
    return this.agentService.distributeTokens(distributeTokensDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentService.remove(+id);
  }
}
