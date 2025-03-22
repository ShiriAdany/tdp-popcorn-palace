import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowtimeService } from './showtime.service';
import { Showtime } from './showtime.entity';
import { Movie } from '../movies/movie.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';

describe('ShowtimeService', () => {
  let service: ShowtimeService;
  let showtimeRepository: Repository<Showtime>;
  let movieRepository: Repository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimeService,
        {
          provide: getRepositoryToken(Showtime),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Movie),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ShowtimeService>(ShowtimeService);
    showtimeRepository = module.get<Repository<Showtime>>(getRepositoryToken(Showtime));
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  describe('getShowtimeById', () => {
    it('should return a showtime if found', async () => {
      const showtime = new Showtime();
      showtime.id = 1;
      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(showtime);

      const result = await service.getShowtimeById(1);
      expect(result).toEqual(showtime);
    });

    it('should throw NotFoundException if showtime is not found', async () => {
      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getShowtimeById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addShowtime', () => {
    it('should add a showtime successfully', async () => {
      const movie = new Movie();
      movie.id = 1;

      const showtimeData: CreateShowtimeDto = {
        movieID: 1,
        theater: 'Sample Theater',
        start_time: '2026-02-14T11:47:46.125405Z',
        end_time: '2026-02-14T14:47:46.125405Z',
        price: 20.2,
      };

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie);
      jest.spyOn(showtimeRepository, 'find').mockResolvedValue([]);
      jest.spyOn(showtimeRepository, 'create').mockReturnValue(showtimeData as any);
      jest.spyOn(showtimeRepository, 'save').mockResolvedValue(showtimeData as any);

      const result = await service.addShowtime(showtimeData);
      expect(result).toEqual(showtimeData);
    });

    it('should throw NotFoundException if movie is not found', async () => {
      const showtimeData: CreateShowtimeDto = {
        movieID: 1,
        theater: 'Sample Theater',
        start_time: '2026-02-14T11:47:46.125405Z',
        end_time: '2026-02-14T14:47:46.125405Z',
        price: 20.2,
      };

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);

      await expect(service.addShowtime(showtimeData)).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if start time is after end time', async () => {
      const movie = new Movie();
      movie.id = 1;

      const showtimeData: CreateShowtimeDto = {
        movieID: 1,
        theater: 'Sample Theater',
        start_time: '2026-02-14T14:47:46.125405Z',
        end_time: '2025-02-14T11:47:46.125405Z',
        price: 20.2,
      };

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie);

      await expect(service.addShowtime(showtimeData)).rejects.toThrow('Start time cannot be after end time');
    });

    it('should throw an error if start time is in the past', async () => {
      const movie = new Movie();
      movie.id = 1;

      const showtimeData: CreateShowtimeDto = {
        movieID: 1,
        theater: 'Sample Theater',
        start_time: '2020-02-14T11:47:46.125405Z',
        end_time: '2025-02-14T14:47:46.125405Z',
        price: 20.2,
      };

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie);

      await expect(service.addShowtime(showtimeData)).rejects.toThrow('Start time cannot be in the past');
    });

    it('should throw an error if start time is the same as end time', async () => {
      const movie = new Movie();
      movie.id = 1;

      const showtimeData: CreateShowtimeDto = {
        movieID: 1,
        theater: 'Sample Theater',
        start_time: '2026-02-14T11:47:46.125405Z',
        end_time: '2026-02-14T11:47:46.125405Z',
        price: 20.2,
      };

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie);

      await expect(service.addShowtime(showtimeData)).rejects.toThrow('Start time cannot be the same as end time');
    });

    it('should throw an error if there are overlapping showtimes', async () => {
      const movie = new Movie();
      movie.id = 1;

      const showtimeData: CreateShowtimeDto = {
        movieID: 1,
        theater: 'Sample Theater',
        start_time: '2026-02-14T11:47:46.125405Z',
        end_time: '2026-02-14T14:47:46.125405Z',
        price: 20.2,
      };

      const existingShowtime = new Showtime();
      existingShowtime.start_time = new Date('2026-02-14T10:47:46.125405Z');
      existingShowtime.end_time = new Date('2026-02-14T12:47:46.125405Z');

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie);
      jest.spyOn(showtimeRepository, 'find').mockResolvedValue([existingShowtime]);

      await expect(service.addShowtime(showtimeData)).rejects.toThrow('Overlapping showtimes for the same theater');
    });
 

    it('should throw an error if movie ID is invalid', async () => {
      const showtimeData: CreateShowtimeDto = {
        movieID: -1, // Invalid movie ID
        theater: 'Sample Theater',
        start_time: '2026-02-14T11:47:46.125405Z',
        end_time: '2026-02-14T14:47:46.125405Z',
        price: 20.2,
      };
    
      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);
    
      await expect(service.addShowtime(showtimeData)).rejects.toThrow('Movie with ID -1 not found');
    });

    it('should throw an error if movie ID is not a valid number', async () => {
      const showtimeData = {
        movieID: 'invalid', // Invalid movie ID format
        theater: 'Sample Theater',
        start_time: '2026-02-14T11:47:46.125405Z',
        end_time: '2026-02-14T14:47:46.125405Z',
        price: 20.2,
      };
    
      // Expect the service to throw a BadRequestException or similar
      await expect(service.addShowtime(showtimeData as any)).rejects.toThrow();
    });

    it('should throw an error if movie ID is missing', async () => {
      const showtimeData = {
        // movieID is missing
        theater: 'Sample Theater',
        start_time: '2026-02-14T11:47:46.125405Z',
        end_time: '2026-02-14T14:47:46.125405Z',
        price: 20.2,
      };
    
      // Expect the service to throw a BadRequestException or similar
      await expect(service.addShowtime(showtimeData as any)).rejects.toThrow();
    });

    describe('CreateShowtimeDto Validation', () => {
      it('should fail validation if price is not a positive number', async () => {
        const invalidShowtime = new CreateShowtimeDto();
        invalidShowtime.movieID = 1;
        invalidShowtime.theater = 'Sample Theater';
        invalidShowtime.start_time = '2026-02-14T11:47:46.125405Z';
        invalidShowtime.end_time = '2026-02-14T14:47:46.125405Z';
        invalidShowtime.price = -10.5; // Invalid: Negative price
    
        const errors = await validate(invalidShowtime);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints.isPositive).toBeDefined(); // Check for isPositive constraint
      });
    
      it('should fail validation if theater name is empty', async () => {
        const invalidShowtime = new CreateShowtimeDto();
        invalidShowtime.movieID = 1;
        invalidShowtime.theater = ''; // Invalid: Empty theater name
        invalidShowtime.start_time = '2026-02-14T11:47:46.125405Z';
        invalidShowtime.end_time = '2026-02-14T14:47:46.125405Z';
        invalidShowtime.price = 20.2;
    
        const errors = await validate(invalidShowtime);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints.isNotEmpty).toBeDefined(); // Check for isNotEmpty constraint
      });
    
      it('should fail validation if movie ID is not a positive integer', async () => {
        const invalidShowtime = new CreateShowtimeDto();
        invalidShowtime.movieID = -1; // Invalid: Negative movie ID
        invalidShowtime.theater = 'Sample Theater';
        invalidShowtime.start_time = '2026-02-14T11:47:46.125405Z';
        invalidShowtime.end_time = '2026-02-14T14:47:46.125405Z';
        invalidShowtime.price = 20.2;
    
        const errors = await validate(invalidShowtime);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints.isPositive).toBeDefined(); // Check for isPositive constraint
      });
    });

  });
});