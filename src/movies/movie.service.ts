import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  // Add new movie
  async addMovie(movieData: CreateMovieDto): Promise<Movie> {
    return this.movieRepository.save(movieData);  
  }

  // Fetch all movies
  async getAllMovies(): Promise<Movie[]> {
    return this.movieRepository.find();
  }
}