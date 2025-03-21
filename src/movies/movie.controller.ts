import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';  
import { UpdateMovieDto } from './dto/update-movie.dto';


@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  
  // HTTP GET endpoint to fetch all movies
  @Get('all')
  async getAllMovies(): Promise<Movie[]>{
    return this.movieService.getAllMovies();
  }

  // HTTP POST endpoint to add a new movie
  @Post()
  async addMovie(@Body() movieData: CreateMovieDto): Promise<Movie> {
    return this.movieService.addMovie(movieData);  
  }

  @Post('update/:title')
  async updateMovie(@Param('title') title: string, @Body() updateData: UpdateMovieDto): Promise<void> {
    await this.movieService.updateMovie(title, updateData);
  }


}
