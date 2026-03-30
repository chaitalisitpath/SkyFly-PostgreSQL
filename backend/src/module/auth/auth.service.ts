import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 10;
const PROVIDER_LOCAL = 'local';
const DEFAULT_EXPIRY = '15m';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const provider = dto.provider ?? PROVIDER_LOCAL;

    // Validate password for local provider
    if (provider === PROVIDER_LOCAL && !dto.password) {
      throw new BadRequestException('Password is required for local signup');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      this.logger.warn(`Registration attempt with existing email: ${dto.email}`);
      throw new BadRequestException('Email is already registered');
    }

    // Hash password only for local users
    const hashedPassword =
      provider === PROVIDER_LOCAL
        ? await bcrypt.hash(dto.password!, BCRYPT_ROUNDS)
        : null;

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone || null,
          dob: dto.dob ? new Date(dto.dob) : null,
          password: hashedPassword,
          provider,
          isProfileComplete: !!(dto.phone && dto.dob),
        },
      });

      this.logger.log(`User registered successfully: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Registration failed for ${dto.email}:`, error);
      throw new BadRequestException('Registration failed');
    }
  }


  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !dto.password) {
      this.logger.warn(`Failed login attempt: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Block non-local users
    if (user.provider !== PROVIDER_LOCAL) {
      throw new UnauthorizedException(
        `This account uses ${user.provider} Sign-In. Please login with ${user.provider}.`,
      );
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password attempt: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        dob: user.dob,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    };
  }

}
