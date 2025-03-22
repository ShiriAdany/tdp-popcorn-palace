import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './booking.entity';
import { ShowtimeModule } from '../showtimes/showtime.module'; 
import { Showtime } from '../showtimes/showtime.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Showtime]), 
    ShowtimeModule, 
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}