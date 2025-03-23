import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; 
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Showtime } from '../src/showtimes/showtime.entity';
import { CreateShowtimeDto } from '../src/showtimes/dto/create-showtime.dto';
import { Movie } from '../src/movies/movie.entity';
import { UpdateShowtimeDto } from '../src/showtimes/dto/update-showtime.dto';

describe('ShowtimeController (e2e)', () => {
  let app: INestApplication;
  let showtimeRepository: Repository<Showtime>;
  let movieRepository: Repository<Movie>;
  

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          disableErrorMessages: false,
        }));
    
    showtimeRepository = moduleFixture.get<Repository<Showtime>>(getRepositoryToken(Showtime));
    movieRepository = moduleFixture.get<Repository<Movie>>(getRepositoryToken(Movie));
    
    await app.init();
  });

    // Cleanup after each test
  afterEach(async () => {
        await showtimeRepository.query('DELETE FROM showtime');
        await movieRepository.query('DELETE FROM movie');
  });

  // Helper function to create a movie
  const createMovie = async (movieData: Partial<Movie>) => {
    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(movieData)
      .expect(200);
    return response.body; // Return the created movie object
  };

  // Test: Get a showtime by ID
  it('should get a showtime by ID', async () => {
    // Create a movie first
    const movie = await createMovie({
      title: 'Harry Potter',
      genre: 'Fantasy',
      duration: 148,
      rating: 10,
      releaseYear: 2001,
    });
  
    //console.log('Created Movie:', movie); // Log the created movie
  
    // Use the created movie's ID
    const createShowtimeDto: CreateShowtimeDto = {
      movieID: movie.id, // Dynamically use the movie's ID
      price: 45.7,
      theater: 'Theater1',
      start_time: '2026-01-01T11:47:46.125405Z',
      end_time: '2026-01-01T14:47:46.125405Z',
    };
  
  
    // Create a showtime
    const createdShowtime = await request(app.getHttpServer())
      .post('/showtimes')
      .send(createShowtimeDto)
      .expect(200);
  
  
    const showtimeId = createdShowtime.body.id;
  
    // Fetch the showtime by ID
    const response = await request(app.getHttpServer())
      .get(`/showtimes/${showtimeId}`)
      .expect(200);
    //console.log(response.body)
  
      expect(response.body).toHaveProperty('id');
  });

  // Test: Add a showtime
  it('should add a showtime', async () => {

    //create movie first
    const movie = await createMovie({
        title: 'Harry Potter',
        genre: 'Fantasy',
        duration: 148,
        rating: 10,
        releaseYear: 2001,
      });
  
      // Use the created movie's ID
    const createShowtimeDto: CreateShowtimeDto = {
      movieID: movie.id, 
      theater: 'Theater1',
      start_time: '2026-01-01T11:47:46.125405Z',
      end_time: '2026-01-01T14:47:46.125405Z',
      price: 105,
    };

    const response = await request(app.getHttpServer())
      .post('/showtimes')
      .send(createShowtimeDto)
      .expect(200);

      expect(response.body).toHaveProperty('id');

  });

  // Test: Update a showtime
  it('should update a showtime', async () => {
    //create movie first
    const movie = await createMovie({
        title: 'Harry Potter',
        genre: 'Fantasy',
        duration: 148,
        rating: 10,
        releaseYear: 2001,
      });
  
      // Use the created movie's ID
    const createShowtimeDto: CreateShowtimeDto = {
      movieID: movie.id, 
      theater: 'Theater1',
      start_time: '2026-01-01T11:47:46.125405Z',
      end_time: '2026-01-01T14:47:46.125405Z',
      price: 50.2,
    };

    const createdShowtime = await request(app.getHttpServer())
      .post('/showtimes')
      .send(createShowtimeDto)
      .expect(200);

    const showtimeId = createdShowtime.body.id;

    // Update the showtime
    const updateShowtimeDto: UpdateShowtimeDto = {
      theater: 'Updated Theater',
      price: 6.5,
    };

    await request(app.getHttpServer())
      .post(`/showtimes/update/${showtimeId}`)
      .send(updateShowtimeDto)
      .expect(200);

    // Verify the update by fetching the showtime
    const updatedShowtime = await request(app.getHttpServer())
      .get(`/showtimes/${showtimeId}`)
      .expect(200);

    expect(updatedShowtime.body).toMatchObject({
      id: showtimeId,
      theater: updateShowtimeDto.theater,
      price: updateShowtimeDto.price,
    });
  });

  // Test: Delete a showtime
  it('should delete a showtime', async () => {
    //create movie first
    const movie = await createMovie({
        title: 'Harry Potter',
        genre: 'Fantasy',
        duration: 148,
        rating: 10,
        releaseYear: 2001,
      });
  
      // Use the created movie's ID
    const createShowtimeDto: CreateShowtimeDto = {
      movieID: movie.id, 
      theater: 'Theater1',
      start_time: '2026-01-01T11:47:46.125405Z',
      end_time: '2026-01-01T14:47:46.125405Z',
      price: 50.2,
    };

    const createdShowtime = await request(app.getHttpServer())
      .post('/showtimes')
      .send(createShowtimeDto)
      .expect(200);

    const showtimeId = createdShowtime.body.id;

    // Delete the showtime
    await request(app.getHttpServer())
      .delete(`/showtimes/${showtimeId}`)
      .expect(200);

    // Verify the showtime is deleted
    await request(app.getHttpServer())
      .get(`/showtimes/${showtimeId}`)
      .expect(404); // Expect 404 Not Found
  });

  afterAll(async () => {
    await app.close();
  });
});