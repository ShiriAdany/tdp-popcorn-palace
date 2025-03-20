import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  // HTTP POST endpoint to add a new movie
  @Post()
  async addMovie(@Body() movieData: Partial<Movie>): Promise<Movie> {
    return this.movieService.addMovie(movieData);  
  }

  
}
