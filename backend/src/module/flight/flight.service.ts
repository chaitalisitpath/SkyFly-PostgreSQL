import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFlightDto, UpdateFlightDto } from './dto/flight.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FlightService {
  constructor(private prisma: PrismaService) {}

  //Get all flights
  async getAllFlights() {
    return this.prisma.flight.findMany({
      include: {
        aircraft: {
          select: {
            id: true,
            model: true,
            economySeatCount: true,
            businessSeatCount: true,
            firstSeatCount: true
          }
        },
        _count: {
          select: {
            bookings: true,
            passengers: true
          }
        }
      },
      orderBy: { departureTime: 'asc' }
    });
  }

  //Get flights by Id
  async getFlightById(id: number) {
    const flight = await this.prisma.flight.findUnique({
      where: { id },
      include: {
        aircraft: {
          select: {
            id: true,
            model: true,
            economySeatCount: true,
            businessSeatCount: true,
            firstSeatCount: true
          }
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            passengers: true
          }
        },
        passengers: {
          select: {
            id: true,
            name: true,
            seatNumber: true,
            seatClass: true
          }
        }
      }
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    return flight;
  }

  //Create flight
  async createFlight(dto: CreateFlightDto) {
    // Validate that fromCity and toCity are not the same
    if (dto.fromCity === dto.toCity) {
      throw new BadRequestException('From city and to city cannot be the same');
    }

    // Validate that departureAirport and arrivalAirport are not the same
    if (dto.departureAirport === dto.arrivalAirport) {
      throw new BadRequestException('Departure airport and arrival airport cannot be the same');
    }

    // Validate that departure time is before arrival time
    const departureTime = new Date(dto.departureTime);
    const arrivalTime = new Date(dto.arrivalTime);
    if (departureTime >= arrivalTime) {
      throw new BadRequestException('Departure time must be before arrival time');
    }

    // Validate that the aircraft exists
    const aircraft = await this.prisma.aircraft.findUnique({
      where: { id: dto.aircraftId }
    });

    if (!aircraft) {
      throw new BadRequestException('Aircraft not found');
    }

    try {
      return await this.prisma.flight.create({
        data: {
          flightNumber: dto.flightNumber,
          departureAirport: dto.departureAirport,
          arrivalAirport: dto.arrivalAirport,
          departureAirportTerminal: dto.departureAirportTerminal,
          arrivalAirportTerminal: dto.arrivalAirportTerminal,
          fromCity: dto.fromCity,
          toCity: dto.toCity,
          departureTime: new Date(dto.departureTime),
          arrivalTime: new Date(dto.arrivalTime),
          aircraftId: dto.aircraftId,
          economyPrice: dto.economyPrice,
          businessPrice: dto.businessPrice,
          firstPrice: dto.firstPrice,
          status: dto.status || 'ON_TIME'
        },
        include: {
          aircraft: {
            select: {
              id: true,
              model: true,
              economySeatCount: true,
              businessSeatCount: true,
              firstSeatCount: true
            }
          }
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Flight number already exists');
      }

      throw error;
    }
  }

  //Update flight
  async updateFlight(id: number, dto: UpdateFlightDto) {
    // Fetch the existing flight to validate against current values
    const existingFlight = await this.prisma.flight.findUnique({ where: { id } });
    if (!existingFlight) {
      throw new NotFoundException('Flight not found');
    }

    // Determine the final values after update
    const finalFromCity = dto.fromCity ?? existingFlight.fromCity;
    const finalToCity = dto.toCity ?? existingFlight.toCity;
    const finalDepartureAirport = dto.departureAirport ?? existingFlight.departureAirport;
    const finalArrivalAirport = dto.arrivalAirport ?? existingFlight.arrivalAirport;
    const finalDepartureTime = dto.departureTime ? new Date(dto.departureTime) : existingFlight.departureTime;
    const finalArrivalTime = dto.arrivalTime ? new Date(dto.arrivalTime) : existingFlight.arrivalTime;

    // Validate that fromCity and toCity are not the same
    if (finalFromCity === finalToCity) {
      throw new BadRequestException('From city and to city cannot be the same');
    }

    // Validate that departureAirport and arrivalAirport are not the same
    if (finalDepartureAirport === finalArrivalAirport) {
      throw new BadRequestException('Departure airport and arrival airport cannot be the same');
    }

    // Validate that departure time is before arrival time
    if (finalDepartureTime >= finalArrivalTime) {
      throw new BadRequestException('Departure time must be before arrival time');
    }

    // If aircraftId is being updated, validate that the aircraft exists
    if (dto.aircraftId) {
      const aircraft = await this.prisma.aircraft.findUnique({
        where: { id: dto.aircraftId }
      });

      if (!aircraft) {
        throw new BadRequestException('Aircraft not found');
      }
    }

    try {
      const updateData: any = {};
      
      if (dto.flightNumber) updateData.flightNumber = dto.flightNumber;
      if (dto.departureAirport) updateData.departureAirport = dto.departureAirport;
      if (dto.arrivalAirport) updateData.arrivalAirport = dto.arrivalAirport;
      if (dto.departureAirportTerminal) updateData.departureAirportTerminal = dto.departureAirportTerminal;
      if (dto.arrivalAirportTerminal) updateData.arrivalAirportTerminal = dto.arrivalAirportTerminal;
      if (dto.fromCity) updateData.fromCity = dto.fromCity;
      if (dto.toCity) updateData.toCity = dto.toCity;
      if (dto.departureTime) updateData.departureTime = new Date(dto.departureTime);
      if (dto.arrivalTime) updateData.arrivalTime = new Date(dto.arrivalTime);
      if (dto.aircraftId) updateData.aircraftId = dto.aircraftId;
      if (dto.economyPrice !== undefined) updateData.economyPrice = dto.economyPrice;
      if (dto.businessPrice !== undefined) updateData.businessPrice = dto.businessPrice;
      if (dto.firstPrice !== undefined) updateData.firstPrice = dto.firstPrice;
      if (dto.status) updateData.status = dto.status;

      return await this.prisma.flight.update({
        where: { id },
        data: updateData,
        include: {
          aircraft: {
            select: {
              id: true,
              model: true,
              economySeatCount: true,
              businessSeatCount: true,
              firstSeatCount: true
            }
          }
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Flight number already exists');
      }

      throw error;
    }
  }

  //Delete flight
  async deleteFlight(id: number) {
    const existingFlight = await this.prisma.flight.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!existingFlight) {
      throw new NotFoundException('Flight not found');
    }

    if (existingFlight._count.bookings > 0) {
      throw new BadRequestException('Cannot delete flight that has existing bookings');
    }

    return await this.prisma.flight.delete({ where: { id } });
  }

  //Search flight using from and to city with date
  async searchFlights(searchDto: any) {
    const where: any = {};

    if (searchDto.fromCity) {
      where.fromCity = {
        contains: searchDto.fromCity,
        mode: 'insensitive',
      };
    }

    if (searchDto.toCity) {
      where.toCity = {
        contains: searchDto.toCity,
        mode: 'insensitive',
      };
    }

    if (searchDto.departureTime) {
      // Validate and parse date
      const departureDate = new Date(searchDto.departureTime);
      if (isNaN(departureDate.getTime())) {
        throw new BadRequestException('Invalid departure date format');
      }

      // If it's a date-only string, set to start of day
      let filterDate: Date;
      if (searchDto.departureTime.includes('T')) {
        filterDate = departureDate;
      } else {
        // Date-only format, assume start of day
        filterDate = new Date(`${searchDto.departureTime}T00:00:00.000Z`);
      }

      where.departureTime = {
        gte: filterDate,
      };
    }

    if (searchDto.arrivalTime) {
      // Validate and parse date
      const arrivalDate = new Date(searchDto.arrivalTime);
      if (isNaN(arrivalDate.getTime())) {
        throw new BadRequestException('Invalid arrival date format');
      }

      // If it's a date-only string, set to end of day
      let filterDate: Date;
      if (searchDto.arrivalTime.includes('T')) {
        filterDate = arrivalDate;
      } else {
        // Date-only format, assume end of day
        filterDate = new Date(`${searchDto.arrivalTime}T23:59:59.999Z`);
      }

      where.arrivalTime = {
        lte: filterDate,
      };
    }

    return this.prisma.flight.findMany({
      where,
      include: {
        aircraft: {
          select: {
            id: true,
            model: true,
            economySeatCount: true,
            businessSeatCount: true,
            firstSeatCount: true
          }
        },
        _count: {
          select: {
            bookings: true,
            passengers: true
          }
        }
      },
      orderBy: { departureTime: 'asc' }
    });
  }

  // Get available seats for a flight by class
  async getAvailableSeats(flightId: number) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        aircraft: true,
        passengers: {
          select: {
            seatClass: true,
            seatNumber: true
          }
        }
      }
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    const { aircraft, passengers } = flight;
    
    // Count occupied seats by class
    const occupiedSeats = {
      ECONOMY: passengers.filter(p => p.seatClass === 'ECONOMY').length,
      BUSINESS: passengers.filter(p => p.seatClass === 'BUSINESS').length,
      FIRST: passengers.filter(p => p.seatClass === 'FIRST').length
    };

    return {
      economy: {
        total: aircraft.economySeatCount || 0,
        occupied: occupiedSeats.ECONOMY,
        available: (aircraft.economySeatCount || 0) - occupiedSeats.ECONOMY
      },
      business: {
        total: aircraft.businessSeatCount || 0,
        occupied: occupiedSeats.BUSINESS,
        available: (aircraft.businessSeatCount || 0) - occupiedSeats.BUSINESS
      },
      first: {
        total: aircraft.firstSeatCount || 0,
        occupied: occupiedSeats.FIRST,
        available: (aircraft.firstSeatCount || 0) - occupiedSeats.FIRST
      }
    };
  }

  // Update flight status
  async updateFlightStatus(id: number, status: string) {
    const flight = await this.prisma.flight.findUnique({ where: { id } });
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    return await this.prisma.flight.update({
      where: { id },
      data: { status: status as any },
      include: {
        aircraft: {
          select: {
            id: true,
            model: true
          }
        }
      }
    });
  }
}
