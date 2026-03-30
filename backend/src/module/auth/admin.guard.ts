import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const ADMIN_ROLE = 'ADMIN';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('AdminGuard: Unauthorized access attempt - no user');
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role !== ADMIN_ROLE) {
      this.logger.warn(`AdminGuard: Unauthorized access by user ${user.email}`);
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}