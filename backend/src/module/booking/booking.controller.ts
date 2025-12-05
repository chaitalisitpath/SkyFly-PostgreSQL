import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async create(@Body() dto: CreateBookingDto, @Req() req: any) {
    const userId = req.user.id;
    return this.bookingService.createBooking(userId, dto);
  }

  @Get()
  async getUserBookings(@Req() req: any) {
    const userId = req.user.id;
    return this.bookingService.getUserBookings(userId);
  }

  @Get(':id')
  async getBookingById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.id;
    return this.bookingService.getBookingById(id, userId);
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllBookings() {
    return this.bookingService.getAllBookings();
  }

  @Put('admin/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateBookingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: 'CONFIRMED' | 'REJECTED' }
  ) {
    return this.bookingService.updateBookingStatus(id, body.status);
  }
}
