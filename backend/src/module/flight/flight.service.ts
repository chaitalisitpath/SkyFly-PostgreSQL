import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFlightDto } from './dto/flight.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FlightService {
  constructor(private prisma: PrismaService) {}

  //Get all flights
  async getAllFlights() {
    return this.prisma.flight.findMany();
  }

  //Get flights by Id
  async getFlightById(id: number) {
    return this.prisma.flight.findUnique({ where: { id } });
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

    try {
      return await this.prisma.flight.create({
        data: {
          ...dto,
          availableSeats: dto.totalSeats,
        },
      });
    } catch (error) {
      // ✅ unique flightNumber error
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Flight already exists');
      }

      throw error;
    }
  }

  //Update flight
  async updateFlight(id: number, dto: Partial<CreateFlightDto>) {
    // Fetch the existing flight to validate against current values
    const existingFlight = await this.prisma.flight.findUnique({ where: { id } });
    if (!existingFlight) {
      throw new BadRequestException('Flight not found');
    }

    // Determine the final values after update
    const finalFromCity = dto.fromCity ?? existingFlight.fromCity;
    const finalToCity = dto.toCity ?? existingFlight.toCity;
    const finalDepartureAirport = dto.departureAirport ?? existingFlight.departureAirport;
    const finalArrivalAirport = dto.arrivalAirport ?? existingFlight.arrivalAirport;

    // Validate that fromCity and toCity are not the same
    if (finalFromCity === finalToCity) {
      throw new BadRequestException('From city and to city cannot be the same');
    }

    // Validate that departureAirport and arrivalAirport are not the same
    if (finalDepartureAirport === finalArrivalAirport) {
      throw new BadRequestException('Departure airport and arrival airport cannot be the same');
    }

    return this.prisma.flight.update({
      where: { id },
      data: dto,
    });
  }

  //Delete flight
  async deleteFlight(id: number) {
    return this.prisma.flight.delete({ where: { id } });
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

    return this.prisma.flight.findMany({ where });
  }
}
