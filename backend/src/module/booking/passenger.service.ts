import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePassengerDto, UpdatePassengerDto } from '../booking/dto/passenger.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PassengerService {
  constructor(private prisma: PrismaService) {}

  // Get all passengers for a specific flight
  async getPassengersByFlight(flightId: number) {
    return this.prisma.passenger.findMany({
      where: { flightId },
      include: {
        booking: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { seatClass: 'asc' },
        { seatNumber: 'asc' }
      ]
    });
  }

  // Get all passengers for a specific booking
  async getPassengersByBooking(bookingId: number) {
    return this.prisma.passenger.findMany({
      where: { bookingId },
      include: {
        flight: {
          select: {
            flightNumber: true,
            departureTime: true,
            arrivalTime: true,
            fromCity: true,
            toCity: true
          }
        }
      },
      orderBy: { seatNumber: 'asc' }
    });
  }

  // Get passenger by ID
  async getPassengerById(id: number) {
    const passenger = await this.prisma.passenger.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        flight: {
          include: {
            aircraft: {
              select: {
                model: true
              }
            }
          }
        }
      }
    });

    if (!passenger) {
      throw new NotFoundException('Passenger not found');
    }

    return passenger;
  }

  // Create a new passenger (typically used when adding to existing booking)
  async createPassenger(dto: CreatePassengerDto) {
    // Verify booking exists
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify flight exists and matches booking
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

    if (flight.id !== booking.flightId) {
      throw new BadRequestException('Flight does not match booking');
    }

    // Check if seat is available
    const seatTaken = flight.passengers.some(p => p.seatNumber === dto.seatNumber);
    if (seatTaken) {
      throw new BadRequestException(`Seat ${dto.seatNumber} is already taken`);
    }

    // Validate seat class capacity
    const classPassengers = flight.passengers.filter(p => p.seatClass === dto.seatClass);
    let maxCapacity = 0;
    
    switch (dto.seatClass) {
      case 'ECONOMY':
        maxCapacity = flight.aircraft.economySeatCount || 0;
        break;
      case 'BUSINESS':
        maxCapacity = flight.aircraft.businessSeatCount || 0;
        break;
      case 'FIRST':
        maxCapacity = flight.aircraft.firstSeatCount || 0;
        break;
    }

    if (classPassengers.length >= maxCapacity) {
      throw new BadRequestException(`No more ${dto.seatClass.toLowerCase()} seats available`);
    }

    try {
      return await this.prisma.passenger.create({
        data: dto,
        include: {
          booking: true,
          flight: {
            select: {
              flightNumber: true,
              fromCity: true,
              toCity: true,
              departureTime: true,
              arrivalTime: true
            }
          }
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Seat number already taken for this flight');
      }
      throw error;
    }
  }

  // Update passenger details
  async updatePassenger(id: number, dto: UpdatePassengerDto) {
    const existingPassenger = await this.prisma.passenger.findUnique({
      where: { id },
      include: {
        flight: {
          include: {
            aircraft: true,
            passengers: {
              where: {
                NOT: { id }  // Exclude current passenger from check
              },
              select: {
                seatNumber: true,
                seatClass: true
              }
            }
          }
        }
      }
    });

    if (!existingPassenger) {
      throw new NotFoundException('Passenger not found');
    }

    // If seat number is being changed, check availability
    if (dto.seatNumber && dto.seatNumber !== existingPassenger.seatNumber) {
      const seatTaken = existingPassenger.flight.passengers.some(
        p => p.seatNumber === dto.seatNumber
      );
      if (seatTaken) {
        throw new BadRequestException(`Seat ${dto.seatNumber} is already taken`);
      }
    }

    // If seat class is being changed, check capacity
    if (dto.seatClass && dto.seatClass !== existingPassenger.seatClass) {
      const classPassengers = existingPassenger.flight.passengers.filter(
        p => p.seatClass === dto.seatClass
      );
      
      let maxCapacity = 0;
      switch (dto.seatClass) {
        case 'ECONOMY':
          maxCapacity = existingPassenger.flight.aircraft.economySeatCount || 0;
          break;
        case 'BUSINESS':
          maxCapacity = existingPassenger.flight.aircraft.businessSeatCount || 0;
          break;
        case 'FIRST':
          maxCapacity = existingPassenger.flight.aircraft.firstSeatCount || 0;
          break;
      }

      if (classPassengers.length >= maxCapacity) {
        throw new BadRequestException(`No more ${dto.seatClass.toLowerCase()} seats available`);
      }
    }

    try {
      return await this.prisma.passenger.update({
        where: { id },
        data: dto,
        include: {
          booking: true,
          flight: {
            select: {
              flightNumber: true,
              fromCity: true,
              toCity: true,
              departureTime: true,
              arrivalTime: true
            }
          }
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Seat number already taken for this flight');
      }
      throw error;
    }
  }

  // Delete passenger
  async deletePassenger(id: number) {
    const passenger = await this.prisma.passenger.findUnique({
      where: { id }
    });

    if (!passenger) {
      throw new NotFoundException('Passenger not found');
    }

    return await this.prisma.passenger.delete({
      where: { id }
    });
  }

  // Get seat map for a flight
  async getFlightSeatMap(flightId: number) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        aircraft: true,
        passengers: {
          select: {
            seatNumber: true,
            seatClass: true,
            name: true
          }
        }
      }
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    const { aircraft, passengers } = flight;
    
    return {
      aircraft: {
        model: aircraft.model,
        economySeatCount: aircraft.economySeatCount,
        businessSeatCount: aircraft.businessSeatCount,
        firstSeatCount: aircraft.firstSeatCount
      },
      occupiedSeats: passengers,
      availableSeats: {
        economy: (aircraft.economySeatCount || 0) - passengers.filter(p => p.seatClass === 'ECONOMY').length,
        business: (aircraft.businessSeatCount || 0) - passengers.filter(p => p.seatClass === 'BUSINESS').length,
        first: (aircraft.firstSeatCount || 0) - passengers.filter(p => p.seatClass === 'FIRST').length
      }
    };
  }
}