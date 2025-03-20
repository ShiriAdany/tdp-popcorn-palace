import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('MovieService', () => {
  let service: MovieService;
  let repository: Repository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getRepositoryToken(Movie),
          useClass: Repository, 
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a new movie', async () => {
    const newMovie: Movie = {
      id: 1,
      title: 'Harry Potter and the Philosopher\'s Stone',
      genre: 'Fantasy',
      release_year: 2001,
      duration: 152,
      rating: 8.8,
    };

    jest.spyOn(repository, 'save').mockResolvedValue(newMovie);

    const result = await service.addMovie(newMovie);

    expect(repository.save).toHaveBeenCalledWith(newMovie);
    expect(result).toEqual(newMovie);
  });
});
