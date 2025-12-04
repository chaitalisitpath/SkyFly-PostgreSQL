import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createBooking(userId: number, dto: CreateBookingDto) {
    const passengerCount = dto.passengers.length;

    // Get the flight details
    const flight = await this.prisma.flight.findUnique({
      where: { id: dto.flightId },
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    // Check if enough seats are available
    if (flight.availableSeats < passengerCount) {
      throw new BadRequestException('Not enough seats available');
    }

    // Calculate total amount
    const totalAmount = passengerCount * Number(flight.price);

    // Use transaction to ensure consistency
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Create the booking
        const booking = await tx.booking.create({
          data: {
            userId,
            flightId: dto.flightId,
            passengerCount,
            totalAmount,
          },
        });

        // Create passengers
        const passengersData = dto.passengers.map((passenger) => ({
          bookingId: booking.id,
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
        }));

        await tx.passenger.createMany({
          data: passengersData,
        });

        // Update available seats
        await tx.flight.update({
          where: { id: dto.flightId },
          data: {
            availableSeats: flight.availableSeats - passengerCount,
          },
        });

        // Return the booking with passengers
        return tx.booking.findUnique({
          where: { id: booking.id },
          include: {
            passengers: true,
            flight: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Failed to create booking');
      }
      throw error;
    }
  }

  async getUserBookings(userId: number) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        flight: true,
        passengers: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getBookingById(id: number, userId?: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        flight: true,
        passengers: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // If userId is provided, check if the booking belongs to the user
    if (userId && booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }
}
