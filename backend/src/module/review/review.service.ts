import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: number, dto: CreateReviewDto) {
    // 1. Verify passenger exists and belongs to a booking for this flight
    const passenger = await this.prisma.passenger.findUnique({
      where: { id: dto.passengerId },
      include: {
        booking: {
          include: {
            user: true,
          },
        },
        flight: true,
      },
    });

    if (!passenger) {
      throw new NotFoundException('Passenger not found');
    }

    // 2. Verify passenger belongs to the authenticated user
    if (passenger.booking.userId !== userId) {
      throw new ForbiddenException('You can only review flights you have booked');
    }

    // 3. Verify passenger is on the specified flight
    if (passenger.flightId !== dto.flightId) {
      throw new BadRequestException('This passenger is not on the specified flight');
    }

    // 4. Check if review already exists (unique constraint)
    const existingReview = await this.prisma.flightReview.findUnique({
      where: {
        passengerId_flightId: {
          passengerId: dto.passengerId,
          flightId: dto.flightId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this flight');
    }

    // 5. Optional: Check if flight has departed (passengers can only review after flight)
    // const now = new Date();
    // if (passenger.flight.departureTime > now) {
    //   throw new BadRequestException('You can only review flights after departure');
    // }

    // 6. Create the review
    return this.prisma.flightReview.create({
      data: {
        passengerId: dto.passengerId,
        flightId: dto.flightId,
        stars: dto.stars,
        content: dto.content,
      },
      include: {
        passenger: {
          select: {
            name: true,
            seatClass: true,
          },
        },
        flight: {
          select: {
            flightNumber: true,
            fromCity: true,
            toCity: true,
          },
        },
      },
    });
  }

  async getFlightReviews(flightId: number) {
    return this.prisma.flightReview.findMany({
      where: { flightId },
      include: {
        passenger: {
          select: {
            name: true,
            seatClass: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserReviews(userId: number) {
    // Get all reviews written by passengers from this user's bookings
    return this.prisma.flightReview.findMany({
      where: {
        passenger: {
          booking: {
            userId,
          },
        },
      },
      include: {
        passenger: {
          select: {
            name: true,
            seatClass: true,
          },
        },
        flight: {
          select: {
            flightNumber: true,
            fromCity: true,
            toCity: true,
            departureTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getReviewById(id: number) {
    const review = await this.prisma.flightReview.findUnique({
      where: { id },
      include: {
        passenger: {
          select: {
            name: true,
            seatClass: true,
          },
        },
        flight: {
          select: {
            flightNumber: true,
            fromCity: true,
            toCity: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

   async getAllReviews(page: number = 1) {
    const pageSize = 3;
    const skip = (page - 1) * pageSize;

    const [reviews, total] = await Promise.all([
      this.prisma.flightReview.findMany({
        skip,
        take: pageSize,
        include: {
          passenger: {
            select: {
              name: true,
              seatClass: true,
            },
          },
          flight: {
            select: {
              flightNumber: true,
              fromCity: true,
              toCity: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.flightReview.count(),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: reviews,
      pagination: {
        currentPage: page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateReview(id: number, userId: number, dto: UpdateReviewDto) {
    // Find the review with passenger booking info
    const review = await this.prisma.flightReview.findUnique({
      where: { id },
      include: {
        passenger: {
          include: {
            booking: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Verify ownership
    if (review.passenger.booking.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update the review
    return this.prisma.flightReview.update({
      where: { id },
      data: dto,
      include: {
        passenger: {
          select: {
            name: true,
            seatClass: true,
          },
        },
        flight: {
          select: {
            flightNumber: true,
            fromCity: true,
            toCity: true,
          },
        },
      },
    });
  }

  async deleteReview(id: number, userId: number) {
    // Find the review with passenger booking info
    const review = await this.prisma.flightReview.findUnique({
      where: { id },
      include: {
        passenger: {
          include: {
            booking: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Verify ownership
    if (review.passenger.booking.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.flightReview.delete({
      where: { id },
    });

    return { message: 'Review deleted successfully' };
  }

  async getFlightStats(flightId: number) {
    const reviews = await this.prisma.flightReview.findMany({
      where: { flightId },
      select: {
        stars: true,
      },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        starDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    const totalStars = reviews.reduce((sum, r) => sum + r.stars, 0);
    const averageRating = Number((totalStars / reviews.length).toFixed(2));

    const starDistribution = {
      1: reviews.filter(r => r.stars === 1).length,
      2: reviews.filter(r => r.stars === 2).length,
      3: reviews.filter(r => r.stars === 3).length,
      4: reviews.filter(r => r.stars === 4).length,
      5: reviews.filter(r => r.stars === 5).length,
    };

    return {
      totalReviews: reviews.length,
      averageRating,
      starDistribution,
    };
  }
}
