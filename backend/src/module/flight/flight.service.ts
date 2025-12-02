import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFlightDto } from './dto/flight.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FlightService {
  constructor(private prisma: PrismaService) {}

  async getAllFlights() {
    return this.prisma.flight.findMany();
  }

  async getFlightById(id: number) {
    return this.prisma.flight.findUnique({ where: { id } });
  }

  async createFlight(dto: CreateFlightDto) {
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

  async updateFlight(id: number, dto: Partial<CreateFlightDto>) {
    return this.prisma.flight.update({
      where: { id },
      data: dto,
    });
  }

  async deleteFlight(id: number) {
    return this.prisma.flight.delete({ where: { id } });
  }
}
