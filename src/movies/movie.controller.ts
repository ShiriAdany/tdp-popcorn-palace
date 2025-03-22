import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, Res, NotFoundException } from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';  
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Response } from 'express'; 



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
  async addMovie(@Body() movieData: CreateMovieDto, @Res() res: Response) {
    try {
      const movie = await this.movieService.addMovie(movieData);
      return res.status(HttpStatus.OK).json(movie);
      
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error adding movie',error: error.message,});
    }
  }
  


  // HTTP POST endpoint to update a movie by title
  @Post('update/:title')
  async updateMovie(@Param('title') title: string, @Body() updateData: UpdateMovieDto, @Res() res: Response) {
    try {
      await this.movieService.updateMovie(title, updateData);
      return res.status(HttpStatus.OK).json({message: `Movie '${title}' updated successfully`,});
      
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: `Movie with title '${title}' not found`,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error updating movie',error: error.message,});
    }
  }

  //HTTP DELETE endpoint to delete a movie by title
  @Delete(':title')
  async deleteMovie(@Param('title') title: string,@Res() res: Response){
    try {
      await this.movieService.deleteMovie(title);
      return res.status(HttpStatus.OK).json({message: `Movie '${title}' deleted successfully`,});

    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({message: `Movie with title '${title}' not found`,});
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error deleting movie',error: error.message,});
    }
  }
 
}
