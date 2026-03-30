import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AdminGuard } from './admin.guard';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleAuthService } from './google/google.service';
import { GoogleAuthController } from './google/google.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRY || '900', 10) },
    }),
  ],
  providers: [AuthService, JwtStrategy, AdminGuard, GoogleAuthService],
  controllers: [AuthController, GoogleAuthController],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}
