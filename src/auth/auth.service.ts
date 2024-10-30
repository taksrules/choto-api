import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-user.dto';
import { PrismaService } from 'common/prisma';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response, response } from 'express';
import { User } from '@prisma/client';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService ,
    private readonly configService:ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 
    const user = await this.prisma.user.create({
      data: {  
        ...createAuthDto,
        tokens: 0,
        password: await bcrypt.hash(createAuthDto.password, 10),
        balance: 0,
        role:'USER',
        status: 'PENDING', 
        verificationCode: verificationCode, 
      }
    });

    

    return user; 
  }

  async login(
    user:User,
    response:Response
  ){  
    const expiresAccessToken= new Date()
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime()+ parseInt(
        this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EPIRATION_MS'
        )
      )
    );
    const tokenPayload:TokenPayload={
      userId:user.id.toString()
    };
    const accessToken =this.jwtService.sign(
      tokenPayload,
      {
        secret:this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_SECRET'
        ),
        expiresIn: `${
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EPIRATION_MS'
          )
        }ms`
      }
    )
    response.cookie('Authentication', accessToken,{
      httpOnly:true,
      secure: this.configService.get('NODE_ENV')==='production',
      expires:expiresAccessToken
    })
    
  }

  async verifyUser(email:string, password:string){
    try{
      const user = await this.getUser(email)
      const authenticated = bcrypt.compareSync(password, user.password);      
      if(authenticated!==true){
        throw new UnauthorizedException()
      }
      return user

    }catch(error:any){      
      throw new UnauthorizedException('Credentilas are not Valid')
    }
  }

  async findAll() {
    return await this.prisma.user.findMany(); // Fetch all users from the database
  }

  async getUser(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if(!user){
      throw new NotFoundException('user not found')
    }
    return user
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if(!user){
      throw new NotFoundException('user not found')
    }
    return user
  }

  

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  async getUserRentals(userId: number) {
    // Ensure the user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Fetch all rental records for the user
    const rentals = await this.prisma.rental.findMany({
      where: { userId },
      include: {
        asset: true,  // Include asset details in the response
      },
    });

    // Return rental history along with related asset details
    return rentals.map(rental => ({
      rentalId: rental.id,
      rentalDate: rental.rentalDate,
      returnDate: rental.returnDate,
      tokensUsed: rental.tokens,
      asset: {
        name: rental.asset.name,
        assetType: rental.asset.assetType,
        qrCode: rental.asset.qrCode,
      },
    }));
  }

  async update(id: number, updateAuthDto: UpdateAuthDto) {
    // Find the user by ID
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated and is unique
    if (updateAuthDto.email && updateAuthDto.email !== user.email) {
      const existingEmailUser = await this.prisma.user.findUnique({ where: { email: updateAuthDto.email } });
      if (existingEmailUser) {
        throw new ConflictException('Email is already in use');
      }
    }

    // Check if phoneNumber is being updated and is unique
    if (updateAuthDto.phoneNumber && updateAuthDto.phoneNumber !== user.phoneNumber) {
      const existingPhoneNumberUser = await this.prisma.user.findFirst({ 
        where: { phoneNumber: updateAuthDto.phoneNumber } 
      });
      if (existingPhoneNumberUser) {
        throw new ConflictException('Phone number is already in use');
      }
    }
    

    // If password is being updated, hash it
    if (updateAuthDto.password) {
      updateAuthDto.password = await bcrypt.hash(updateAuthDto.password, 10);
    }

    // Update the user in the database
    return this.prisma.user.update({
      where: { id },
      data: { ...updateAuthDto },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async getVerificationCode(email: string) {
    const user = await this.getUser(email); 
    if (user.status !== 'PENDING') {
        throw new UnauthorizedException('User is not in PENDING status'); 
    }
    return { verificationCode: user.verificationCode }; 
  }

  async activateUser(email: string, verificationCode: string) {
    const user = await this.getUser(email);
    if (user.status !== 'PENDING') {
        throw new UnauthorizedException('User is not in PENDING status');
    }
    if (user.verificationCode !== verificationCode) {
        throw new UnauthorizedException('Invalid verification code'); 
    }

    // Here you would typically check for deposit payment logic
    // For example, you might check if a payment has been made in your payment service

    // Update user status to ACTIVE
    const updatedUser = await this.prisma.user.update({
        where: { email },
        data: { status: 'ACTIVE' },
    });

    return updatedUser; // Return the updated user information
  }

  async getUserTransactions(userId: number) {
   
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        agent: {
          include: {
            user: true,  
          },
        },
        asset: true,    
      },
    });
    
    // Return the transaction history with key details
    return transactions.map(transaction => ({
      transactionId: transaction.id,
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      tokenAmount: transaction.tokenAmount,
      transactionDate: transaction.transactionDate,
      asset: transaction.asset ? {
        name: transaction.asset.name,
        assetType: transaction.asset.assetType,
      } : null,
      agent: transaction.agent ? {
        name: transaction.agent.user.name,  // Now we can safely access agent's user details
        email: transaction.agent.user.email,
      } : null,
    }));
    

    // Return the transaction history with key details
    return transactions.map(transaction => ({
      transactionId: transaction.id,
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      tokenAmount: transaction.tokenAmount,
      transactionDate: transaction.transactionDate,
      asset: transaction.asset ? {
        name: transaction.asset.name,
        assetType: transaction.asset.assetType
      } : null,
      agent: transaction.agent ? {
        name: transaction.agent.user.name,
        email: transaction.agent.user.email
      } : null
    }));
  }

  async getTokenBalance(userId: number) {
    
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    
    return {
      userId: user.id,
      tokens: user.tokens
    };
  }
}
