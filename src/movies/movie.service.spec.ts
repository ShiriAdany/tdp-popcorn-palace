import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { validate } from 'class-validator';

describe('MovieService', () => {
  let service: MovieService;
  let repository: Repository<Movie>;
  let app: INestApplication;

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

    // Create an INestApplication instance
    app = module.createNestApplication();
    // Apply the ValidationPipe globally
    app.useGlobalPipes(new ValidationPipe());
    await app.init(); // Initialize the app

    service = module.get<MovieService>(MovieService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  afterEach(async () => {
    await app.close(); // Close the app after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a new movie', async () => {
    const newMovie: Movie = {
      id: 1,
      title: 'Inception',
      genre: 'Sci-Fi',
      release_year: 2010,
      duration: 148,
      rating: 8.8,
    };

    jest.spyOn(repository, 'save').mockResolvedValue(newMovie);

    const result = await service.addMovie(newMovie);

    expect(repository.save).toHaveBeenCalledWith(newMovie);
    expect(result).toEqual(newMovie);
  });

  describe('CreateMovieDto Validation', () => {
    it('should pass validation with valid data', async () => {
      const validMovie = new CreateMovieDto();
      validMovie.title = 'Inception';
      validMovie.genre = 'Sci-Fi';
      validMovie.duration = 148;
      validMovie.rating = 8.8;
      validMovie.release_year = 2010;

      const errors = await validate(validMovie);
      expect(errors.length).toBe(0); 
    });

    it('should fail validation if title is empty', async () => {
      const invalidMovie = new CreateMovieDto();
      invalidMovie.title = ''; // Invalid: Empty title
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.release_year = 2010;

      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); 
      expect(errors[0].constraints.minLength).toBeDefined(); // Check for minLength constraint
    });

    it('should fail validation if title is too long', async () => {
      const invalidMovie = new CreateMovieDto();
      invalidMovie.title = 'A'.repeat(101); // Invalid: Title exceeds max length
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.release_year = 2010;

      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); 
      expect(errors[0].constraints.maxLength).toBeDefined(); // Check for maxLength constraint
    });

    it('should fail validation if genre is invalid', async () => {
      const invalidMovie = new CreateMovieDto();
      invalidMovie.title = 'Inception';
      invalidMovie.genre = 'InvalidGenre'; // Invalid: Genre not in enum
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.release_year = 2010;

      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); 
      expect(errors[0].constraints.isEnum).toBeDefined(); // Check for isEnum constraint
    });

    it('should fail validation if duration is not a positive integer', async () => {
      const invalidMovie = new CreateMovieDto();
      invalidMovie.title = 'Inception';
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = -148; // Invalid: Negative duration
      invalidMovie.rating = 8.8;
      invalidMovie.release_year = 2010;

      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); 
      expect(errors[0].constraints.isPositive).toBeDefined(); // Check for isPositive constraint
    });

    it('should fail validation if rating is out of range', async () => {
      const invalidMovie = new CreateMovieDto();
      invalidMovie.title = 'Inception';
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 11; // Invalid: Rating exceeds max value
      invalidMovie.release_year = 2010;

      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); 
      expect(errors[0].constraints.max).toBeDefined(); // Check for max constraint
    });

    it('should fail validation if release_year is too early', async () => {
      const invalidMovie = new CreateMovieDto();
      invalidMovie.title = 'Inception';
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.release_year = 1887; // Invalid: Year before 1888

      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); 
      expect(errors[0].constraints.min).toBeDefined(); // Check for min constraint
    });

    it('should fail validation if release_year is in the future', async () => {
      const invalidMovie = new CreateMovieDto();
      invalidMovie.title = 'Inception';
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.release_year = new Date().getFullYear() + 1; // Invalid: Year in the future

      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); 
      expect(errors[0].constraints.max).toBeDefined(); // Check for max constraint
    });
  });
});