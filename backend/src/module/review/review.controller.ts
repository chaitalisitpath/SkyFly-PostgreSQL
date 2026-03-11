import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.createReview(req.user.id, createReviewDto);
  }

  @Get('flight/:flightId')
  getFlightReviews(@Param('flightId', ParseIntPipe) flightId: number) {
    return this.reviewService.getFlightReviews(flightId);
  }

  @Get('flight/:flightId/stats')
  getFlightStats(@Param('flightId', ParseIntPipe) flightId: number) {
    return this.reviewService.getFlightStats(flightId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getUserReviews(@Request() req) {
    return this.reviewService.getUserReviews(req.user.id);
  }

  @Get(':id')
  getReviewById(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.getReviewById(id);
  }

  @Get()
  getAllReviews(@Query('page', new ParseIntPipe({ optional: true })) page?: number) {
    return this.reviewService.getAllReviews(page || 1);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(id, req.user.id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.reviewService.deleteReview(id, req.user.id);
  }
}
