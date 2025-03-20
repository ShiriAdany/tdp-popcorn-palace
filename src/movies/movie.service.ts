import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  // add a new movie
  async addMovie(movieData: Partial<Movie>): Promise<Movie> {
    return this.movieRepository.save(movieData);  
  }

  // update movie information
  // async updateMovie(movieData: Partial<Movie>): Promise<Movie> {
  //   return this.movieRepository.update(movieData);  
  // }

  
}
