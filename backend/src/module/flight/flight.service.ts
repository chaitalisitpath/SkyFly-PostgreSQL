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

  //Search flight with advanced filters, pagination, and sorting
  async searchFlights(searchDto: any) {
    console.log('SearchFlights called with params:', JSON.stringify(searchDto, null, 2));
    const where: any = {};

    console.log('Building where clause...');

    // Flight number filter
    if (searchDto.flightNumber) {
      where.flightNumber = {
        contains: searchDto.flightNumber,
        mode: 'insensitive',
      };
    }

    // City filters
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

    // Departure time range
    if (searchDto.departureTimeFrom || searchDto.departureTimeTo) {
      where.departureTime = {};
      if (searchDto.departureTimeFrom) {
        const departureFrom = new Date(searchDto.departureTimeFrom);
        if (isNaN(departureFrom.getTime())) {
          throw new BadRequestException('Invalid departureTimeFrom format');
        }
        where.departureTime.gte = departureFrom;
      }
      if (searchDto.departureTimeTo) {
        const departureTo = new Date(searchDto.departureTimeTo);
        if (isNaN(departureTo.getTime())) {
          throw new BadRequestException('Invalid departureTimeTo format');
        }
        where.departureTime.lte = departureTo;
      }
    }

    // Arrival time range
    if (searchDto.arrivalTimeFrom || searchDto.arrivalTimeTo) {
      where.arrivalTime = {};
      if (searchDto.arrivalTimeFrom) {
        const arrivalFrom = new Date(searchDto.arrivalTimeFrom);
        if (isNaN(arrivalFrom.getTime())) {
          throw new BadRequestException('Invalid arrivalTimeFrom format');
        }
        where.arrivalTime.gte = arrivalFrom;
      }
      if (searchDto.arrivalTimeTo) {
        const arrivalTo = new Date(searchDto.arrivalTimeTo);
        if (isNaN(arrivalTo.getTime())) {
          throw new BadRequestException('Invalid arrivalTimeTo format');
        }
        where.arrivalTime.lte = arrivalTo;
      }
    }

    // Status filter - default to ON_TIME for user search if not specified
    if (searchDto.status) {
      where.status = searchDto.status;
    } else {
      // For user search, only show active flights
      where.status = 'ON_TIME';
    }

    // Price filter (max price)
    if (searchDto.maxPrice !== undefined) {
      const priceConditions = [
        { economyPrice: { lte: searchDto.maxPrice } },
        { businessPrice: { lte: searchDto.maxPrice } },
        { firstPrice: { lte: searchDto.maxPrice } }
      ];
      where.AND = where.AND || [];
      where.AND.push({ OR: priceConditions });
    }

    // Aircraft filter
    if (searchDto.aircraftId) {
      where.aircraftId = searchDto.aircraftId;
    }

    // Class filter: show flights that offer at least one of the selected classes
    if (searchDto.classes && searchDto.classes.length > 0) {
      const classConditions: any[] = [];
      if (searchDto.classes.includes('ECONOMY')) {
        classConditions.push({ economyPrice: { not: null } });
      }
      if (searchDto.classes.includes('BUSINESS')) {
        classConditions.push({ businessPrice: { not: null } });
      }
      if (searchDto.classes.includes('FIRST')) {
        classConditions.push({ firstPrice: { not: null } });
      }
      if (classConditions.length > 0) {
        where.AND = where.AND || [];
        where.AND.push({ OR: classConditions });
      }
    }

    // Pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 5;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchDto.sortBy || 'departureTime';
    const sortOrder = searchDto.sortOrder || 'asc';
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination metadata
    const total = await this.prisma.flight.count({ where });
    console.log('Where clause:', JSON.stringify(where, null, 2));
    console.log('Total count:', total);

    // Get flights
    const flights = await this.prisma.flight.findMany({
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
      orderBy,
      skip,
      take: limit
    });

    const result = {
      data: flights,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    console.log('SearchFlights returning:', { dataCount: flights.length, pagination: result.pagination });
    return result;
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
