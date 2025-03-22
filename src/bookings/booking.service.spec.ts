import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingService } from './booking.service';
import { Booking } from './booking.entity';
import { Showtime } from '../showtimes/showtime.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepository: Repository<Booking>;
  let showtimeRepository: Repository<Showtime>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Showtime),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    showtimeRepository = module.get<Repository<Showtime>>(getRepositoryToken(Showtime));
  });

  describe('bookTicket', () => {
    it('should successfully book a ticket', async () => {
      const showtimeId = 1;
      const seatNumber = 15;
      const userId = '84438967-f68f-4fa0-b620-0f08217e76af';
      
      const showtime = new Showtime();
      showtime.id = showtimeId;

      const newBooking: CreateBookingDto = { showtimeId, seatNumber, userId };
      const savedBooking = { id: 1, ...newBooking, showtime };  // Ensure showtime is included

      // Mock repository methods
      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(showtime);
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(null); // No existing booking
      jest.spyOn(bookingRepository, 'create').mockReturnValue(savedBooking);
      jest.spyOn(bookingRepository, 'save').mockResolvedValue(savedBooking);

      const result = await service.bookTicket(newBooking);

      expect(result).toEqual(savedBooking);
      expect(showtimeRepository.findOne).toHaveBeenCalledWith({ where: { id: showtimeId } });
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { showtimeId, seatNumber } });
      expect(bookingRepository.create).toHaveBeenCalledWith({ ...newBooking, showtime });
      expect(bookingRepository.save).toHaveBeenCalledWith(savedBooking);
    });

    it('should throw NotFoundException if showtime does not exist', async () => {
      const showtimeId = 999; // Non-existent showtime ID
      const newBooking: CreateBookingDto = { showtimeId, seatNumber: 5, userId: 'user-uuid' };

      // Mock showtime not found
      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(null);

      await expect(service.bookTicket(newBooking))
        .rejects
        .toThrow(NotFoundException);
      await expect(service.bookTicket(newBooking))
        .rejects
        .toThrow(`Showtime with ID ${showtimeId} not found`);
    });

    it('should throw ConflictException if seat is already booked', async () => {
      const showtimeId = 1;
      const seatNumber = 5;
      const userId = 'user-uuid';

      const showtime = new Showtime();
      showtime.id = showtimeId;

      const existingBooking = new Booking();
      existingBooking.showtimeId = showtimeId;
      existingBooking.seatNumber = seatNumber;
      existingBooking.userId = userId;

      const newBooking: CreateBookingDto = { showtimeId, seatNumber, userId };

      // Mock repository methods
      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(showtime);
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(existingBooking); // Seat already booked

      await expect(service.bookTicket(newBooking))
        .rejects
        .toThrow(ConflictException);
      await expect(service.bookTicket(newBooking))
        .rejects
        .toThrow(`Seat number ${seatNumber} is already booked for this showtime`);
    });
  });
});
