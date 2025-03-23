import { Controller, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Response } from 'express';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './booking.entity';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // HTTP POST Endpoint to book a ticket
  @Post()
  async bookTicket(@Body() createBookingDto: CreateBookingDto, @Res() res: Response): Promise<void> {
    try {
      const booking = await this.bookingService.bookTicket(createBookingDto);
      res.status(HttpStatus.OK).json({ bookingId: booking.bookingId });  
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'An error occurred while booking the ticket',
      });
    }
  }
}
