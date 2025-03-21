import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';  // Import the DTO

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  // HTTP POST endpoint to add a new movie
  @Post()
  async addMovie(@Body() movieData: CreateMovieDto): Promise<Movie> {
    return this.movieService.addMovie(movieData);  
  }

  // HTTP GET endpoint to fetch all movies
  @Get('all')
  async getAllMovies(): Promise<Movie[]>{
    return this.movieService.getAllMovies();
  }

}
