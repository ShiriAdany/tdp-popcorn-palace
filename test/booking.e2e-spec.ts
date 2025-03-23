import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module'; 
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Showtime } from '../src/showtimes/showtime.entity';
import { Movie } from '../src/movies/movie.entity';
import { Booking } from '../src/bookings/booking.entity'

describe('Booking System E2E Tests', () => {
  let app: INestApplication;
  let bookingRepository: Repository<Booking>
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
    bookingRepository = moduleFixture.get<Repository<Booking>>(getRepositoryToken(Booking))
    showtimeRepository = moduleFixture.get<Repository<Showtime>>(getRepositoryToken(Showtime));
    movieRepository = moduleFixture.get<Repository<Movie>>(getRepositoryToken(Movie));
    await app.init();
  });

  // Cleanup after each test
  afterEach(async () => {
    await bookingRepository.query('Delete FROM booking')
    await showtimeRepository.query('DELETE FROM showtime');
    await movieRepository.query('DELETE FROM movie');
  });

  afterAll(async () => {
    await app.close();
  });



// Helper function to create a movie and showtime with internal data
async function createMovieAndShowtime(app: any) {
  const movieData = {
    title: 'Mulan',
    genre: 'Animation',
    duration: 150,
    rating: 9.7,
    releaseYear: 2003,
  };

  const showtimeData = {
    price: 50.2,
    theater: 'Theater3',
    start_time: '2026-01-01T11:47:46.125405Z',
    end_time: '2026-01-01T14:47:46.125405Z',
  };

  const createMovieResponse = await request(app.getHttpServer())
    .post('/movies')
    .send(movieData)
    .expect(200);  // Expecting successful creation

  const movieId = createMovieResponse.body.id;
  const createShowtimeResponse = await request(app.getHttpServer())
    .post('/showtimes')
    .send({
      ...showtimeData,
      movieID: movieId,
    })
    .expect(200);  // Expecting successful creation

  return createShowtimeResponse.body.id;  // Return the showtime ID
}

  it('should book a ticket successfully', async () => {
    const showtimeId = await createMovieAndShowtime(app);
    // Create the booking for the showtime
    const response = await request(app.getHttpServer())
      .post('/bookings')
      .send({
        showtimeId: showtimeId,
        seatNumber: 20,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',  // Example user ID
      })
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBeDefined();
  });


  it('should fail if required fields are missing', async () => {
    const showtimeId = await createMovieAndShowtime(app);

    const response = await request(app.getHttpServer())
      .post('/bookings')
      .send({
        showtimeId: showtimeId,
        seatNumber: 15,
        // userId is missing
      })
      .expect(400);  // Expected error status code- Bad request

  });

  it('should fail if booking is attempted with an invalid showtimeId', async () => {
    const response = await request(app.getHttpServer())
      .post('/bookings')
      .send({
        showtimeId: 999,  // Invalid showtimeId
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      })
      .expect(404);  // Expected error status code- Not found

  });

  it('should fail if seatNumber is already taken', async () => {
    const showtimeId = await createMovieAndShowtime(app);

    // Create the booking for the showtime
    const first_booking = await request(app.getHttpServer())
      .post('/bookings')
      .send({
        showtimeId: showtimeId,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',  // Example user ID
      })
      .expect(200);

    expect(first_booking.body).toHaveProperty('id');
    expect(first_booking.body.id).toBeDefined();


    const new_booking = await request(app.getHttpServer())
      .post('/bookings')
      .send({
        showtimeId: showtimeId,
        seatNumber: 15,  // Assuming seat 15 is already taken
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      })
      .expect(409);  // Expected error status code- conflict exception

  });
});
