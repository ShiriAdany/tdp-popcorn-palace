import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';  
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Movie } from '../src/movies/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieDto } from '../src/movies/dto/create-movie.dto';

describe('MovieController (e2e)', () => {
  let app: INestApplication;
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
  
    await app.init();
  
    movieRepository = moduleFixture.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  // Cleanup after tests
  afterEach(async () => {
    await movieRepository.query('DELETE FROM movie');
  });

  it('should return all movies', async () => {
    const createMovieDto: CreateMovieDto = {
      title: 'movie1',
      genre: 'Sci-Fi',
      duration: 120,
      rating: 8.8,
      releaseYear: 2010,
    };

    await request(app.getHttpServer()).post('/movies').send(createMovieDto).expect(200);
    
    const response = await request(app.getHttpServer()).get('/movies/all').expect(200);
    console.log("all movies: ",response.body)
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should create a movie', async () => {
    const createMovieDto: CreateMovieDto = {
      title: 'movie1',
      genre: 'Sci-Fi',
      duration: 120,
      rating: 8.8,
      releaseYear: 2010,
    };

    const response = await request(app.getHttpServer()).post('/movies').send(createMovieDto).expect(200);
    console.log("add movie: ", response.body)
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toEqual(createMovieDto.title);
    expect(response.body.genre).toEqual(createMovieDto.genre);
    expect(response.body.duration).toEqual(createMovieDto.duration);
    expect(response.body.rating).toEqual(createMovieDto.rating);
    expect(response.body.releaseYear).toEqual(createMovieDto.releaseYear);
  });

  it('should throw an error if movie with the same title already exists', async () => {
    const createMovieDto: CreateMovieDto = {
      title: 'movie1',
      genre: 'Sci-Fi',
      duration: 120,
      rating: 8.8,
      releaseYear: 2010,
    };

    // Create the movie
    await request(app.getHttpServer()).post('/movies').send(createMovieDto).expect(200);

    // Attempt to create the same movie again
    const response = await request(app.getHttpServer()).post('/movies').send(createMovieDto)
    
    expect(response.status).toBe(409);

  });

  it('should throw error if title is too short', async () => {
    const createMovieDto: CreateMovieDto = {
      title: '', // Invalid title
      genre: 'Action',
      duration: 120,
      rating: 8.0,
      releaseYear: 2022,
    };

    const response = await request(app.getHttpServer()).post('/movies').send(createMovieDto).expect(400);

  });

  it('should throw error if genre is not valid', async () => {
    const createMovieDto: CreateMovieDto = {
      title: 'movie2',
      genre: 'Invalid', // Invalid genre
      duration: 120,
      rating: 2.2,
      releaseYear: 2022,
    };

    const response = await request(app.getHttpServer()).post('/movies').send(createMovieDto).expect(400);

  });

  it('should throw error if rating is not in range [0,10]', async () => {
    const createMovieDto: CreateMovieDto = {
      title: 'movie2',
      genre: 'Action',
      duration: 120,
      rating: 11, // Invalid rating
      releaseYear: 2022,
    };

    const response = await request(app.getHttpServer()).post('/movies').send(createMovieDto).expect(400);

  });

  it('should throw error if release year is invalid', async () => {
    const createMovieDto: CreateMovieDto = {
      title: 'movie2',
      genre: 'Action',
      duration: 120,
      rating: 7.5,
      releaseYear: 3000, // Invalid year
    };

    const response = await request(app.getHttpServer()).post('/movies').send(createMovieDto).expect(400);

  });

  it('should update an existing movie', async () => {
    const createMovieDto: CreateMovieDto = {
      title: 'movie2',
      genre: 'Romance',
      duration: 148,
      rating: 8.8,
      releaseYear: 2010,
    };

    // Create the movie first
    const createdResponse = await request(app.getHttpServer()).post('/movies').send(createMovieDto).expect(200);

    const movieTitle = createdResponse.body.title;

    // Now update the movie
    const updatedMovieDto = {
      duration: 120,
    };

    const updateResponse = await request(app.getHttpServer())
      .post(`/movies/update/${movieTitle}`)
      .send(updatedMovieDto)
      .expect(200);

    //update requirment- response body is empty
    const updatedMovie = await movieRepository.findOne({ where: { title: movieTitle } });
    expect(updatedMovie.duration).toEqual(updatedMovieDto.duration);
  });

  it('should throw an error if trying to update a non-existent movie', async () => {
    const updateMovieDto = { releaseYear: 1999 };

    const response = await request(app.getHttpServer())
      .post('/movies/update/nonexistent-movie')
      .send(updateMovieDto)
      .expect(404);

  });

  it('should delete an existing movie', async () => {
    const createMovieDto: CreateMovieDto = {
      title: 'movie2',
      genre: 'Romance',
      duration: 148,
      rating: 8.8,
      releaseYear: 2010,
    };

    // Create the movie first
    const createdResponse = await request(app.getHttpServer()).post('/movies').send(createMovieDto).expect(200);
    const movieTitle = createdResponse.body.title;

    // Now delete the movie
    await request(app.getHttpServer()).delete(`/movies/${movieTitle}`).expect(200);

    // Try to fetch the deleted movie
    const getResponse = await request(app.getHttpServer())
      .get(`/movies/${movieTitle}`)
      .expect(404);

  });

  it('should throw an error if trying to delete a non-existent movie', async () => {
    const response = await request(app.getHttpServer())
      .delete('/movies/nonexistent-movie')
      .expect(404);

  });

  afterAll(async () => {
    await app.close();
  });
});
