import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from '../showtimes/showtime.entity';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';  

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    
    @InjectRepository(Showtime)
    private showtimeRepository: Repository<Showtime>
  ) {}

  //book a (available) ticket- given showtime ID ,seat number, and user ID
  // Example with Pessimistic Locking

async bookTicket(newBooking: CreateBookingDto): Promise<Booking> {
    const { showtimeId, seatNumber, userId } = newBooking;
  
    // Check if showtime exists
    const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } });
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${showtimeId} not found`);
    }
  
    // Lock the row for this seat to ensure no other transaction can modify it
    const existingBooking = await this.bookingRepository.findOne({
      where: { showtimeId, seatNumber },
      lock: { mode: 'pessimistic_write' },  // Pessimistic lock
    });
  
    if (existingBooking) {
      throw new ConflictException(`Seat number ${seatNumber} is already booked for this showtime`);
    }
  
    // Create and save the new booking
    const booking = this.bookingRepository.create({
      showtimeId,
      seatNumber,
      userId,
      showtime,
    });
    return this.bookingRepository.save(booking);
  }
  
}
