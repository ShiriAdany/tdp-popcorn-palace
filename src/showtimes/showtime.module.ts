import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowtimeService } from './showtime.service';
import { ShowtimeController } from './showtime.controller';
import { Showtime } from './showtime.entity';
import { MovieModule } from '../movies/movie.module'; 
import { Movie } from '../movies/movie.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Showtime, Movie]), 
    MovieModule, 
  ],
  controllers: [ShowtimeController],
  providers: [ShowtimeService],
  exports: [TypeOrmModule.forFeature([Showtime])],
})
export class ShowtimeModule {}