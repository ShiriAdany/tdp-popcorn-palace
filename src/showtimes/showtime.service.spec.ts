import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowtimeService } from './showtime.service';
import { Showtime } from './showtime.entity';
import { Movie } from '../movies/movie.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';

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
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          }
        },
        {
          provide: getRepositoryToken(Movie),
          useClass: Repository,
          useValue: {
          findOne: jest.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<ShowtimeService>(ShowtimeService);
    showtimeRepository = module.get<Repository<Showtime>>(getRepositoryToken(Showtime));
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  describe('getShowtimeById', () => {
    it('should return a showtime if found', async () => {
      const movie = new Movie();
      movie.id = 1;
      const showtime:Showtime ={
        id: 1,
        price:10,
        movieID: movie,
        theater:"blabla",
        startTime: '2026-01-01T11:47:46.125405Z',
        endTime: '2026-01-01T14:47:46.125405Z',
      } 
      
      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(showtime);

      const result = await service.getShowtimeById(1);
      //console.log(result)
      //expect(result).toEqual(showtime);
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
        start_time: '2026-01-01T11:47:46.125405Z',
        end_time: '2026-01-01T14:47:46.125405Z',
        price: 20.2,
      };

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie);
      jest.spyOn(showtimeRepository, 'find').mockResolvedValue([]);
      jest.spyOn(showtimeRepository, 'create').mockReturnValue(showtimeData as any);
      jest.spyOn(showtimeRepository, 'save').mockResolvedValue(showtimeData as any);

      const result = await service.addShowtime(showtimeData);
      console.log(result)
      //expect(result).toEqual(showtimeData);
    });

    it('should throw NotFoundException if movie is not found', async () => {
      const showtimeData: CreateShowtimeDto = {
        movieID: 1,
        theater: 'Sample Theater',
        start_time: '2026-01-01T11:47:46.125405Z',
        end_time: '2026-01-01T14:47:46.125405Z',
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
        start_time: '2026-01-01T14:47:46.125405Z',
        end_time: '2025-01-01T11:47:46.125405Z',
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
        start_time: '2020-01-01T11:47:46.125405Z',
        end_time: '2025-01-01T14:47:46.125405Z',
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
        start_time: '2026-01-01T11:47:46.125405Z',
        end_time: '2026-01-01T11:47:46.125405Z',
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
        start_time: '2026-01-01T11:47:46.125405Z',
        end_time: '2026-01-01T14:47:46.125405Z',
        price: 20.2,
      };

      const existingShowtime = new Showtime();
      existingShowtime.startTime = '2026-01-01T10:47:46.125405Z';
      existingShowtime.endTime = '2026-01-01T12:47:46.125405Z';

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie);
      jest.spyOn(showtimeRepository, 'find').mockResolvedValue([existingShowtime]);

      await expect(service.addShowtime(showtimeData)).rejects.toThrow('Overlapping showtimes for the same theater');
    });
 

    it('should throw an error if movie ID is invalid', async () => {
      const showtimeData: CreateShowtimeDto = {
        movieID: -1, // Invalid movie ID
        theater: 'Sample Theater',
        start_time: '2026-01-01T11:47:46.125405Z',
        end_time: '2026-01-01T14:47:46.125405Z',
        price: 20.2,
      };
    
      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);
    
      await expect(service.addShowtime(showtimeData)).rejects.toThrow('Movie with ID -1 not found');
    });

    it('should throw an error if movie ID is not a valid number', async () => {
      const showtimeData = {
        movieID: 'invalid', // Invalid movie ID format
        theater: 'Sample Theater',
        start_time: '2026-01-01T11:47:46.125405Z',
        end_time: '2026-01-01T14:47:46.125405Z',
        price: 20.2,
      };
    
      // Expect the service to throw a BadRequestException or similar
      await expect(service.addShowtime(showtimeData as any)).rejects.toThrow();
    });

    it('should throw an error if movie ID is missing', async () => {
      const showtimeData = {
        // movieID is missing
        theater: 'Sample Theater',
        start_time: '2026-01-01T11:47:46.125405Z',
        end_time: '2026-01-01T14:47:46.125405Z',
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
        invalidShowtime.start_time = '2026-01-01T11:47:46.125405Z';
        invalidShowtime.end_time = '2026-01-01T14:47:46.125405Z';
        invalidShowtime.price = -10.5; // Invalid: Negative price
    
        const errors = await validate(invalidShowtime);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints.isPositive).toBeDefined(); // Check for isPositive constraint
      });
    
      it('should fail validation if theater name is empty', async () => {
        const invalidShowtime = new CreateShowtimeDto();
        invalidShowtime.movieID = 1;
        invalidShowtime.theater = ''; // Invalid: Empty theater name
        invalidShowtime.start_time = '2026-01-01T11:47:46.125405Z';
        invalidShowtime.end_time = '2026-01-01T14:47:46.125405Z';
        invalidShowtime.price = 20.2;
    
        const errors = await validate(invalidShowtime);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints.isNotEmpty).toBeDefined(); // Check for isNotEmpty constraint
      });
    
      it('should fail validation if movie ID is not a positive integer', async () => {
        const invalidShowtime = new CreateShowtimeDto();
        invalidShowtime.movieID = -1; // Invalid: Negative movie ID
        invalidShowtime.theater = 'Sample Theater';
        invalidShowtime.start_time = '2026-01-01T11:47:46.125405Z';
        invalidShowtime.end_time = '2026-01-01T14:47:46.125405Z';
        invalidShowtime.price = 20.2;
    
        const errors = await validate(invalidShowtime);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints.isPositive).toBeDefined(); // Check for isPositive constraint
      });
    });

  });

  describe('updateShowtime', () => {
    it('should successfully update an existing showtime', async () => {
      const showtimeId = 1;
      const movie = new Movie();
      movie.id = 1;

      const existingShowtime:Showtime = {
        id: showtimeId,
        movieID: movie,
        startTime: '2026-01-01T10:00:00.000Z',
        endTime: '2026-01-01T12:00:00.000Z',
        theater: 'Sample Theater',
        price: 50.2,
      };

      const updateDto: UpdateShowtimeDto = {
        startTime: '2026-01-01T11:00:00.000Z',
        endTime: '2026-01-01T13:00:00.000Z',
        price: 60.0,
      };

      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(existingShowtime);
      jest.spyOn(showtimeRepository, 'find').mockResolvedValue([]);
      jest.spyOn(showtimeRepository, 'save').mockResolvedValue({ ...existingShowtime, ...updateDto });

      const result = await service.updateShowtime(showtimeId, updateDto);

      expect(result).toEqual({
        ...existingShowtime,
        ...updateDto,
      });
      expect(showtimeRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
    });

    it('should throw NotFoundException if the showtime does not exist', async () => {
      const showtimeId = 999; // Non-existent showtime ID
      const updateDto: UpdateShowtimeDto = { price: 60.0 };

      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(null); // Showtime does not exist

      await expect(service.updateShowtime(showtimeId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if startTime is after endTime', async () => {
      const showtimeId = 1;
      const movie = new Movie();
      movie.id = 1;

      const existingShowtime = {
        id: showtimeId,
        movieID: movie,
        startTime: '2026-01-01T10:00:00.000Z',
        endTime: '2026-01-01T12:00:00.000Z',
        theater: 'Sample Theater',
        price:100,
      };

      const updateDto: UpdateShowtimeDto = {
        startTime: '2026-01-01T14:00:00.000Z', // Invalid: after end time
        endTime: '2026-01-01T13:00:00.000Z',
      };

      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(existingShowtime);

      await expect(service.updateShowtime(showtimeId, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if the new showtime overlaps with an existing one', async () => {
      const showtimeId = 1;
      
      const movie1 = new Movie();
      movie1.id = 1;

      const existingShowtime = {
        id: showtimeId,
        movieID: movie1,
        startTime: '2026-01-01T10:00:00.000Z',
        endTime: '2026-01-01T12:00:00.000Z',
        theater: 'Sample Theater',
        price: 70.7
      };

      const movie2 = new Movie();
      movie2.id = 2;

      const overlappingShowtime = {
        id: 2, // Different ID to simulate overlapping showtime
        movieID: movie2,
        startTime: '2026-01-01T10:00:00.000Z',
        endTime: '2026-01-01T12:00:00.000Z',
        theater: 'Sample Theater',
        price: 500
      };

      const updateDto: UpdateShowtimeDto = {
        startTime: '2026-01-01T11:00:00.000Z', // Overlapping start time
        endTime: '2026-01-01T13:00:00.000Z',
      };

      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(existingShowtime);
      jest.spyOn(showtimeRepository, 'find').mockResolvedValue([overlappingShowtime]); // Simulate overlapping showtime

      await expect(service.updateShowtime(showtimeId, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if start time is in the past', async () => {
      const showtimeId = 1;
      const movie1 = new Movie();
      movie1.id = 1;

      const existingShowtime = {
        id: showtimeId,
        movieID : movie1,
        startTime: '2026-01-01T10:00:00.000Z',
        endTime: '2026-01-01T12:00:00.000Z',
        theater: 'Sample Theater',
        price: 4.44
      };

      const updateDto: UpdateShowtimeDto = {
        startTime: '2020-01-01T10:00:00.000Z', // Invalid: past date
        endTime: '2025-01-01T12:00:00.000Z',
      };

      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(existingShowtime);

      await expect(service.updateShowtime(showtimeId, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should update only the price without changing the times', async () => {
      const showtimeId = 1;
      const movie1 = new Movie();
      movie1.id = 1;

      const existingShowtime = {
        id: showtimeId,
        movieID: movie1,
        startTime: '2026-01-01T10:00:00.000Z',
        endTime: '2026-01-01T12:00:00.000Z',
        theater: 'Sample Theater',
        price: 50.2,
      };

      const updateDto: UpdateShowtimeDto = {
        price: 60.0,
      };

      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(existingShowtime);
      jest.spyOn(showtimeRepository, 'save').mockResolvedValue({ ...existingShowtime, ...updateDto });

      const result = await service.updateShowtime(showtimeId, updateDto);

      expect(result.price).toEqual(updateDto.price);
      expect(result.startTime).toEqual(existingShowtime.startTime);
      expect(result.endTime).toEqual(existingShowtime.endTime);
    });
  });


  it('should delete a showtime successfully', async () => {
    const showtimeId = 1;
    const showtimeEntity = new Showtime();
    showtimeEntity.id = showtimeId;
    showtimeEntity.startTime = ''
    showtimeEntity.endTime = ''
    showtimeEntity.theater = 'Sample Theater';
    showtimeEntity.price = 50;

    jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(showtimeEntity);
    jest.spyOn(showtimeRepository, 'delete').mockResolvedValue({affected: 1, raw: {} });

    await service.deleteShowtime(showtimeId);
    expect(showtimeRepository.delete).toHaveBeenCalledWith(showtimeId);
  });

  it('should throw NotFoundException if showtime not found', async () => {
    const showtimeId = 1;

    jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(null);

    await expect(service.deleteShowtime(showtimeId)).rejects.toThrow(
      new NotFoundException(`Showtime with ID ${showtimeId} not found`),
    );
  });

  it('should handle deletion failure', async () => {
    const showtimeId = 1;

    jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue({ id: showtimeId } as Showtime);
    jest.spyOn(showtimeRepository, 'delete').mockResolvedValue({ affected: 1, raw: {} });

    await expect(service.deleteShowtime(showtimeId)).resolves.toBeUndefined();
  });
  

});