import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: any) {
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

  @Put(':id')
  async updateBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingDto,
    @Req() req: any
  ) {
    // Users can only update their own bookings
    const userId = req.user.id;
    const booking = await this.bookingService.getBookingById(id, userId);
    return this.bookingService.updateBooking(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBooking(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.id;
    return this.bookingService.deleteBooking(id, userId);
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(AdminGuard)
  async getAllBookings() {
    return this.bookingService.getAllBookings();
  }

  @Get('admin/flight/:flightId')
  @UseGuards(AdminGuard)
  async getBookingsByFlight(@Param('flightId', ParseIntPipe) flightId: number) {
    return this.bookingService.getBookingsByFlight(flightId);
  }

  @Put('admin/:id')
  @UseGuards(AdminGuard)
  async adminUpdateBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingDto
  ) {
    return this.bookingService.updateBooking(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminDeleteBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.deleteBooking(id);
  }
}
