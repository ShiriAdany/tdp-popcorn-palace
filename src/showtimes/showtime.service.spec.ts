import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimeService } from './showtime.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './showtime.entity';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';

describe('ShowtimeService', () => {
  let service: ShowtimeService;
  let repository: Repository<Showtime>;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimeService,
        {
          provide: getRepositoryToken(Showtime),
          useClass: Repository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init(); 

    service = module.get<ShowtimeService>(ShowtimeService);
    repository = module.get<Repository<Showtime>>(getRepositoryToken(Showtime));
  });

  afterEach(async () => {
    await app.close(); // Close the app after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getShowtimeById', () => {
    it('should return a showtime by id', async () => {
        const mockShowtime = {
            id: 1,
            movie: 'Movie1',
            theater: 'Theater1',
            start_time: new Date('2025-02-14T11:47:46.125405Z'),
            end_time: new Date('2025-02-14T14:47:46.125405Z'),
            price: 50.2,
        };
        
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockShowtime);

      const result = await service.getShowtimeById(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockShowtime);
    });

    it('should throw a NotFoundException if the showtime does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      try {
        await service.getShowtimeById(999); // Non-existent ID
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Showtime with ID 999 not found');
      }
    });
  });
});
