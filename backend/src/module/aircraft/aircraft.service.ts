import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAircraftDto, UpdateAircraftDto } from './dto/aircraft.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AircraftService {
  constructor(private prisma: PrismaService) {}

  // Get all aircrafts
  async getAllAircraft() {
    return this.prisma.aircraft.findMany({
      include: {
        _count: {
          select: { flights: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get aircraft by ID
  async getAircraftById(id: number) {
    const aircraft = await this.prisma.aircraft.findUnique({
      where: { id },
      include: {
        flights: {
          select: {
            id: true,
            flightNumber: true,
            departureTime: true,
            arrivalTime: true,
            fromCity: true,
            toCity: true,
            status: true
          },
          orderBy: { departureTime: 'desc' }
        }
      }
    });

    if (!aircraft) {
      throw new NotFoundException('Aircraft not found');
    }

    return aircraft;
  }

  // Create aircraft
  async createAircraft(dto: CreateAircraftDto) {
    try {
      return await this.prisma.aircraft.create({
        data: dto
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Aircraft model already exists');
      }
      throw error;
    }
  }

  // Update aircraft
  async updateAircraft(id: number, dto: UpdateAircraftDto) {
    const existingAircraft = await this.prisma.aircraft.findUnique({
      where: { id }
    });

    if (!existingAircraft) {
      throw new NotFoundException('Aircraft not found');
    }

    try {
      return await this.prisma.aircraft.update({
        where: { id },
        data: dto
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Aircraft model already exists');
      }
      throw error;
    }
  }

  // Delete aircraft
  async deleteAircraft(id: number) {
    const existingAircraft = await this.prisma.aircraft.findUnique({
      where: { id },
      include: {
        _count: {
          select: { flights: true }
        }
      }
    });

    if (!existingAircraft) {
      throw new NotFoundException('Aircraft not found');
    }

    if (existingAircraft._count.flights > 0) {
      throw new BadRequestException('Cannot delete aircraft that has associated flights');
    }

    return await this.prisma.aircraft.delete({
      where: { id }
    });
  }

  // Get aircraft models for dropdown
  async getAircraftModels() {
    return this.prisma.aircraft.findMany({
      select: {
        id: true,
        model: true,
        economySeatCount: true,
        businessSeatCount: true,
        firstSeatCount: true
      },
      orderBy: { model: 'asc' }
    });
  }

  // Get seat map for aircraft
  async getSeatMap(id: number) {
    const aircraft = await this.prisma.aircraft.findUnique({
      where: { id }
    });

    if (!aircraft) {
      throw new NotFoundException('Aircraft not found');
    }

    const seatMap = {
      economy: this.generateSeats(aircraft.economySeatCount || 0, 5, 'E'), // A-E, E for economy
      business: this.generateSeats(aircraft.businessSeatCount || 0, 4, 'B'), // A-D, B for business
      first: this.generateSeats(aircraft.firstSeatCount || 0, 2, 'F'), // A-B, F for first
    };

    return seatMap;
  }

  // Helper to generate seats
  private generateSeats(count: number, columns: number, classSuffix: string): string[] {
    const seats: string[] = [];
    const rows = Math.ceil(count / columns);
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let row = 1; row <= rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (seats.length < count) {
          seats.push(`${row}${letters[col]}${classSuffix}`);
        }
      }
    }

    return seats;
  }
}
