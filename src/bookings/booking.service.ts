import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { Showtime } from '../showtimes/showtime.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Transaction, EntityManager } from 'typeorm';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    @InjectRepository(Showtime)
    private showtimeRepository: Repository<Showtime>, // Inject ShowtimeRepository
  ) {}

  //book a (available) ticket- given showtime ID, seat number, and user ID
  async bookTicket(newBooking: CreateBookingDto): Promise<Booking> {
    const { showtimeId, seatNumber, userId } = newBooking;
    return await this.bookingRepository.manager.transaction(async (transactionalEntityManager) => {
      // Check if showtime exists within the transaction
      const showtime = await transactionalEntityManager.findOne(Showtime, { where: { id: showtimeId } });
      if (!showtime) {
        throw new NotFoundException(`Showtime with ID ${showtimeId} not found`);
      }

      // Lock the row for this seat to ensure no other transaction can modify it
      const existingBooking = await transactionalEntityManager.findOne(Booking, {
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

      return transactionalEntityManager.save(Booking, booking);  // Save the booking within the transaction
    });
  }
}
