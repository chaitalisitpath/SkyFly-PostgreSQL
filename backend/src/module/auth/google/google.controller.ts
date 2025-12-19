import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { GoogleAuthService } from './google.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class GoogleAuthController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('google-login')
  async googleLogin(@Body('token') token: string) {
    console.log('Google login initiated for token:', token.substring(0, 20) + '...');

    // 1️⃣ Verify token with Google
    const googleUser = await this.googleAuthService.verifyToken(token);
    console.log('Google user verified:', { email: googleUser.email, name: googleUser.name });

    // 2️⃣ Find user by email
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });
    console.log('Existing user found:', user ? { id: user.id, isProfileComplete: user.isProfileComplete, phone: user.phone, dob: user.dob } : 'No user found');

    // 3️⃣ Create user if not exists
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email!,
          name: googleUser.name ?? 'Google User',
          provider: 'google',
          googleId: googleUser.sub,
          role: 'USER',
          password: null,
          phone: null,
          dob: null
        },
      });
      console.log('New user created:', { id: user.id, isProfileComplete: user.isProfileComplete });
    }

    // 4️⃣ Generate your JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    console.log('JWT generated for user:', user.id);

    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isProfileComplete: user.isProfileComplete,
      phone: user.phone,
      dob: user.dob,
    };
    console.log('Login response user:', responseUser);

    return {
      access_token,
      user: responseUser,
    };
  }
}
