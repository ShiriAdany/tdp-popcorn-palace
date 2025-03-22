import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { BadRequestException, ConflictException, NotFoundException, ValidationPipe } from '@nestjs/common';
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

  it('should return all movies', async () => {
    const movies: Movie[] = [
      {
        id: 1,
        title: 'Toy Story',
        genre: 'Animation',
        duration: 81,
        rating: 8.3,
        releaseYear: 1995,
      },
      {
        id: 2,
        title: 'Titanic',
        genre: 'Romance',
        duration: 195,
        rating: 7.8,
        releaseYear: 1997,
      },
    ];
  
    jest.spyOn(repository, 'find').mockResolvedValue(movies);
  
    const result = await service.getAllMovies();
    expect(repository.find).toHaveBeenCalled();
    expect(result).toEqual(movies);
  });

  it('should throw ConflictException when movie with same title exists', async () => {
    const existingMovie: Movie = {
      id: 1,
      title: 'Toy Story',
      genre: 'Animation',
      releaseYear: 1995,
      duration: 81,
      rating: 8.3,
    };

    const newMovie: Movie = {
      id: 2,
      title: 'Toy Story',
      genre: 'Animation',
      releaseYear: 1995,
      duration: 81,
      rating: 8.3,
    };

    jest.spyOn(repository, 'findOne').mockResolvedValue(existingMovie);

    await expect(service.addMovie(newMovie)).rejects.toThrowError(new ConflictException('A movie with the title "Toy Story" already exists.'));
  });

  it('should add a new movie when title is unique', async () => {
    const newMovie: Movie = {
      id: 2,
      title: 'The Lion King',
      genre: 'Animation',
      releaseYear: 1994,
      duration: 88,
      rating: 8.5,
    };

    jest.spyOn(repository, 'findOne').mockResolvedValue(null); 
    jest.spyOn(repository, 'save').mockResolvedValue(newMovie);

    const result = await service.addMovie(newMovie);

    expect(result).toEqual(newMovie);
    expect(repository.save).toHaveBeenCalledWith(newMovie);
  });


  describe('CreateMovieDto Validation', () => {
    it('should pass validation with valid data', async () => {
      const validMovie = new CreateMovieDto();
      validMovie.title = 'Inception';
      validMovie.genre = 'Sci-Fi';
      validMovie.duration = 148;
      validMovie.rating = 8.8;
      validMovie.releaseYear = 2010;

      const errors = await validate(validMovie);
      expect(errors.length).toBe(0); 
    });

    it('should fail validation if title is empty', async () => {
      const invalidMovie = new CreateMovieDto();
      invalidMovie.title = ''; // Invalid: Empty title
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.releaseYear = 2010;

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
      invalidMovie.releaseYear = 2010;

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
      invalidMovie.releaseYear = 2010;

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
      invalidMovie.releaseYear = 2010;

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
      invalidMovie.releaseYear = 2010;

      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); 
      expect(errors[0].constraints.max).toBeDefined(); // Check for max constraint
    });

    it('should fail validation if releaseYear is too early', async () => {
      const invalidMovie = new CreateMovieDto();
      invalidMovie.title = 'Inception';
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.releaseYear = 1887; // Invalid: Year before 1888

      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); 
      expect(errors[0].constraints.min).toBeDefined(); // Check for min constraint
    });

    it('should fail validation if releaseYear is in the future', async () => {
      const invalidMovie = new CreateMovieDto();
      invalidMovie.title = 'Inception';
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.releaseYear = new Date().getFullYear() + 1; // Invalid: Year in the future

      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); 
      expect(errors[0].constraints.max).toBeDefined(); // Check for max constraint
    });
  });

  it('should update the Mulan movie successfully', async () => {
    const title = 'Mulan';
    const existingMovie = new Movie();
    existingMovie.title = title;
    existingMovie.genre = 'Animation';
    existingMovie.duration = 88;
    existingMovie.rating = 7.6;
    existingMovie.releaseYear = 1998;

    const updateData: UpdateMovieDto = {
      genre: 'Action',
      rating: 8.0,
    };

    jest.spyOn(repository, 'findOne').mockResolvedValue(existingMovie);
    jest.spyOn(repository, 'save').mockResolvedValue(existingMovie);
    
    await service.updateMovie(title, updateData);

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Mulan', // Title should stay the same
      genre: 'Action', // Genre should be updated
      rating: 8.0, // Rating should be updated
    }));
  });

  it('should throw NotFoundException if Mulan movie is not found', async () => {
    const title = 'Mulan';
    const updateData: UpdateMovieDto = {
      genre: 'Action',
    };

    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(service.updateMovie(title, updateData)).rejects.toThrow(NotFoundException);
    await expect(service.updateMovie(title, updateData)).rejects.toThrow(
      `Movie with title "${title}" not found`
    );
  });

  it('should update only the provided fields (partial update) for Mulan movie', async () => {
    const title = 'Mulan';
    const existingMovie = new Movie();
    existingMovie.title = title;
    existingMovie.genre = 'Animation';
    existingMovie.duration = 88;
    existingMovie.rating = 7.6;
    existingMovie.releaseYear = 1998;

    const updateData: UpdateMovieDto = {
      genre: 'Drama',
    };

    jest.spyOn(repository, 'findOne').mockResolvedValue(existingMovie);
    jest.spyOn(repository, 'save').mockResolvedValue(existingMovie);

    await service.updateMovie(title, updateData);

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Mulan', // Title should stay the same
      genre: 'Drama', // Genre should be updated
      duration: 88, // Duration should remain the same (not in update data)
      rating: 7.6, // Rating should remain the same (not in update data)
      releaseYear: 1998, // Release year should remain the same (not in update data)
    }));
  });
  
  describe('UpdateMovieDto Validation', () => {
    it('should pass validation with valid data', async () => {
      const validMovie = new UpdateMovieDto();
      validMovie.genre = 'Sci-Fi';
      validMovie.duration = 148;
      validMovie.rating = 8.8;
      validMovie.releaseYear = 2010;
  
      const errors = await validate(validMovie);
      expect(errors.length).toBe(0); // Should pass validation
    });
  
    it('should fail validation if genre is invalid', async () => {
      const invalidMovie = new UpdateMovieDto();
      invalidMovie.genre = 'InvalidGenre'; // Invalid genre
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.releaseYear = 2010;
  
      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); // Should fail validation
      expect(errors[0].constraints.isEnum).toBeDefined(); 
    });
  
    it('should fail validation if duration is not a positive integer', async () => {
      const invalidMovie = new UpdateMovieDto();
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = -148; // Invalid- Negative duration
      invalidMovie.rating = 8.8;
      invalidMovie.releaseYear = 2010;
  
      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); // Should fail validation
      expect(errors[0].constraints.isPositive).toBeDefined(); 
    });
  
    it('should fail validation if rating is out of range', async () => {
      const invalidMovie = new UpdateMovieDto();
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 11; // Invalid- Rating exceeds max value
      invalidMovie.releaseYear = 2010;
  
      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); // Should fail validation
      expect(errors[0].constraints.max).toBeDefined(); 
    });
  
    it('should fail validation if releaseYear is too early', async () => {
      const invalidMovie = new UpdateMovieDto();
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.releaseYear = 1887; // Invalid- Year before 1888
  
      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); // Should fail validation
      expect(errors[0].constraints.min).toBeDefined(); 
    });
  
    it('should fail validation if releaseYear is in the future', async () => {
      const invalidMovie = new UpdateMovieDto();
      invalidMovie.genre = 'Sci-Fi';
      invalidMovie.duration = 148;
      invalidMovie.rating = 8.8;
      invalidMovie.releaseYear = new Date().getFullYear() + 1; // Invalid- Year in the future
  
      const errors = await validate(invalidMovie);
      expect(errors.length).toBeGreaterThan(0); // Should fail validation
      expect(errors[0].constraints.max).toBeDefined(); 
    });
  });


  it('should delete a movie successfully', async () => {
    const title = 'Mulan';
    const existingMovie = new Movie();
    existingMovie.title = title;

    // Mock findOne to return the existing movie
    jest.spyOn(repository, 'findOne').mockResolvedValue(existingMovie);
    // Mock remove to resolve successfully
    jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

    await service.deleteMovie(title);

    expect(repository.remove).toHaveBeenCalledWith(existingMovie);
  });

  it('should throw NotFoundException if movie is not found', async () => {
    const title = 'Mulan';

    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(service.deleteMovie(title)).rejects.toThrow(NotFoundException);
    await expect(service.deleteMovie(title)).rejects.toThrow(
      `Movie with title "${title}" not found`
    );
  });
  
  
});