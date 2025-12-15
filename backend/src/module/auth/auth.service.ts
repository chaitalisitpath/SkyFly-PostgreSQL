import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Injectable, BadRequestException, UnauthorizedException  } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,) {}

  //Register service
 async register(dto: RegisterDto) {
  // 1️⃣ Check if email already exists
  const existingUser = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });
 
  if (existingUser) {
    throw new BadRequestException('Email is already registered');
  }

  // ✅ Default provider
  const provider = dto.provider ?? 'local';

  let hashedPassword: string | null = null;

  // ✅ Only hash password for local users
  if (provider === 'local') {
    if (!dto.password) {
      throw new BadRequestException('Password is required for local signup');
    }

    hashedPassword = await bcrypt.hash(dto.password, 10);
  }

  // 3️⃣ Create user
  const user = await this.prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      dob: new Date(dto.dob),
      password: hashedPassword, 
      provider,
    },
  });

  return user;
}


//Login Service
 async login(dto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // ✅ Block Google users
  if (user.provider === 'google') {
    throw new UnauthorizedException(
      'This account uses Google Sign-In. Please login with Google.',
    );
  }

  // ✅ Type narrowing (THIS FIXES THE ERROR)
  if (!dto.password || !user.password) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(
    dto.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const token = this.jwtService.sign(payload);

  return {
    access_token: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      dob: user.dob,
      role: user.role,
    },
  };
}

}
