import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    // 1️⃣ Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3️⃣ Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    return user;
  }
}
