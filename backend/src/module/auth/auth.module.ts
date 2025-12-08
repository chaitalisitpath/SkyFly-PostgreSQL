import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AdminGuard } from './admin.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleAuthService } from './google/google.service';
import { GoogleAuthController } from './google/google.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, JwtStrategy, AdminGuard, PrismaService, GoogleAuthService],
  controllers: [AuthController, GoogleAuthController],
  exports: [AuthService, AdminGuard], // optional if you want to use it elsewhere
})
export class AuthModule {}
