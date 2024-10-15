import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApproveAgentDto } from './dto/approve-agent.dto';
import { AssignRoleDto } from './dto/role-assignment.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


  @Patch('approve-agent')
  @ApiOperation({ summary: 'Approve a new agent and allocate initial tokens' })
  @UseGuards(JwtAuthGuard) // Ensure the admin is authenticated
  async approveAgent(@Body() approveAgentDto: ApproveAgentDto) {
    return this.adminService.approveAgent(approveAgentDto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Retrieve a paginated list of all users in the system' })
  @UseGuards(JwtAuthGuard) // Ensure the admin is authenticated
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of users per page' })
  async getAllUsers(
    @Query('page') page = 1,       // Default to page 1 if not provided
    @Query('limit') limit = 10     // Default to 10 users per page if not provided
  ) {
    return this.adminService.getAllUsers({ page, limit });
  }

  @Get('agents')
  @ApiOperation({ summary: 'Retrieve a paginated list of all agents in the system' })
  @UseGuards(JwtAuthGuard) // Ensure the admin is authenticated
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of agents per page' })
  async getAllAgents(
    @Query('page') page = 1,       // Default to page 1 if not provided
    @Query('limit') limit = 10     // Default to 10 agents per page if not provided
  ) {
    return this.adminService.getAllAgents({ page, limit });
  }

  @Post('assign-role')
  @ApiOperation({ summary: 'Assign a new role to a user (e.g., upgrade to agent)' })
  @UseGuards(JwtAuthGuard) // Ensure the admin is authenticated
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.adminService.assignRole(assignRoleDto);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Retrieve system-wide statistics for the admin dashboard' })
  @UseGuards(JwtAuthGuard) // Ensure the admin is authenticated
  async getOverview() {
    return this.adminService.getOverview();
  }
}
