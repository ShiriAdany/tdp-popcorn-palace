import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

import { ConflictException } from '@nestjs/common';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  // Fetch all movies
  async getAllMovies(): Promise<Movie[]> {
    return this.movieRepository.find();
  }
  
  // Add new movie
  async addMovie(movieData: CreateMovieDto): Promise<Movie> {
    const existingMovie = await this.movieRepository.findOne({
      where: { title: movieData.title },
    });

    if (existingMovie) {
      throw new ConflictException(`A movie with the title "${movieData.title}" already exists.`);
    }
    return this.movieRepository.save(movieData);
  }

  // Update a movie
  async updateMovie(title: string, updateData: UpdateMovieDto): Promise<void>{
    const movie = await this.movieRepository.findOne({ where: { title } });

    if (!movie) {
      throw new NotFoundException(`Movie with title "${title}" not found`);
    }

    Object.assign(movie, updateData);
    await this.movieRepository.save(movie);

  }
  
}