import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/create-booking.dto';
import { PassengerDto } from './dto/passenger.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  private async validateSeats(flight: any, passengers: PassengerDto[]) {
    const { aircraft } = flight;
    const occupiedSeats = flight.passengers;

    // Group passengers by seat class
    const passengersBySeatClass = {
      ECONOMY: passengers.filter(p => p.seatClass === 'ECONOMY'),
      BUSINESS: passengers.filter(p => p.seatClass === 'BUSINESS'),
      FIRST: passengers.filter(p => p.seatClass === 'FIRST')
    };

    // Check seat capacity for each class
    if (passengersBySeatClass.ECONOMY.length > (aircraft.economySeatCount || 0)) {
      return { isValid: false, message: 'Not enough economy seats available' };
    }

    if (passengersBySeatClass.BUSINESS.length > (aircraft.businessSeatCount || 0)) {
      return { isValid: false, message: 'Not enough business seats available' };
    }

    if (passengersBySeatClass.FIRST.length > (aircraft.firstSeatCount || 0)) {
      return { isValid: false, message: 'Not enough first class seats available' };
    }

    // Check for duplicate seat selections in the current booking
    const seatNumbers = passengers.map(p => p.seatNumber);
    const uniqueSeats = new Set(seatNumbers);
    if (seatNumbers.length !== uniqueSeats.size) {
      return { isValid: false, message: 'Duplicate seat selections found' };
    }

    // Check if any selected seats are already occupied
    const occupiedSeatNumbers = occupiedSeats.map((p: any) => p.seatNumber);
    for (const passenger of passengers) {
      if (occupiedSeatNumbers.includes(passenger.seatNumber)) {
        return { isValid: false, message: `Seat ${passenger.seatNumber} is already occupied` };
      }
    }

    return { isValid: true, message: 'All seats are valid' };
  }

  async createBooking(userId: number, dto: CreateBookingDto) {
    // Get the flight details with aircraft information
    const flight = await this.prisma.flight.findUnique({
      where: { id: dto.flightId },
      include: {
        aircraft: true,
        passengers: {
          select: {
            seatNumber: true,
            seatClass: true
          }
        }
      }
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    // Validate passenger count matches the provided passengers
    if (dto.passengerCount !== dto.passengers.length) {
      throw new BadRequestException('Passenger count does not match the number of passengers provided');
    }

    // Check seat availability and validate seat selections
    const seatValidation = await this.validateSeats(flight, dto.passengers);
    if (!seatValidation.isValid) {
      throw new BadRequestException(seatValidation.message);
    }

    // Use transaction to ensure consistency
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Create the booking
        const booking = await tx.booking.create({
          data: {
            userId,
            flightId: dto.flightId,
            passengerCount: dto.passengerCount,
            totalAmount: dto.totalAmount,
          },
        });

        // Create passengers with seat information
        const passengersData = dto.passengers.map((passenger) => ({
          bookingId: booking.id,
          flightId: dto.flightId,
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
          seatClass: passenger.seatClass,
          seatNumber: passenger.seatNumber,
        }));

        await tx.passenger.createMany({
          data: passengersData,
        });

        // Return the booking with passengers and flight details
        return tx.booking.findUnique({
          where: { id: booking.id },
          include: {
            passengers: true,
            flight: {
              include: {
                aircraft: {
                  select: {
                    model: true,
                    economySeatCount: true,
                    businessSeatCount: true,
                    firstSeatCount: true
                  }
                }
              }
            },
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
        flight: {
          include: {
            aircraft: {
              select: {
                model: true,
                economySeatCount: true,
                businessSeatCount: true,
                firstSeatCount: true
              }
            }
          }
        },
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
        flight: {
          include: {
            aircraft: {
              select: {
                model: true,
                economySeatCount: true,
                businessSeatCount: true,
                firstSeatCount: true
              }
            }
          }
        },
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

  async getAllBookings() {
    return this.prisma.booking.findMany({
      include: {
        flight: {
          include: {
            aircraft: {
              select: {
                model: true,
                economySeatCount: true,
                businessSeatCount: true,
                firstSeatCount: true
              }
            }
          }
        },
        passengers: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateBooking(id: number, dto: UpdateBookingDto) {
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
      include: { passengers: true }
    });

    if (!existingBooking) {
      throw new NotFoundException('Booking not found');
    }

    // If passenger count is being updated, validate it
    if (dto.passengerCount && dto.passengerCount !== existingBooking.passengers.length) {
      throw new BadRequestException('Cannot change passenger count after booking is created');
    }

    return this.prisma.booking.update({
      where: { id },
      data: dto,
      include: {
        flight: {
          include: {
            aircraft: {
              select: {
                model: true,
                economySeatCount: true,
                businessSeatCount: true,
                firstSeatCount: true
              }
            }
          }
        },
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
  }

  async deleteBooking(id: number, userId?: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { passengers: true }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user has permission to delete this booking
    if (userId && booking.userId !== userId) {
      throw new BadRequestException('You can only delete your own bookings');
    }

    // Delete in transaction to ensure consistency
    return await this.prisma.$transaction(async (tx) => {
      // Delete passengers first due to foreign key constraints
      await tx.passenger.deleteMany({
        where: { bookingId: id }
      });

      // Then delete the booking
      return await tx.booking.delete({
        where: { id }
      });
    });
  }

  async getBookingsByFlight(flightId: number) {
    return this.prisma.booking.findMany({
      where: { flightId },
      include: {
        passengers: {
          select: {
            name: true,
            seatNumber: true,
            seatClass: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
