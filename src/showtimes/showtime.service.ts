import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { Movie } from '../movies/movie.entity'; 



@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,

    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  // Get a showtime by ID
  async getShowtimeById(id: number): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findOne({where: {id}});

    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }

    return showtime;
  }

  // Add a showtime
  async addShowtime(showtimeData: CreateShowtimeDto): Promise<Showtime> {
    const { movieID, start_time, end_time, ...rest } = showtimeData;
  
    // Check if the movie exists
    const movieEntity = await this.movieRepository.findOne({ where: { id: movieID } });
    if (!movieEntity) {
      throw new NotFoundException(`Movie with ID ${movieID} not found`);
    }
  
    // Validate times
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
  
    if (startTime > endTime) {
      throw new Error('Start time cannot be after end time');
    }
  
    if (startTime < new Date()) {
      throw new Error('Start time cannot be in the past');
    }
  
    if (startTime.getTime() === endTime.getTime()) {
      throw new Error('Start time cannot be the same as end time');
    }
  
    // Check for overlapping showtimes in the same theater
    const existingShowtimes = await this.showtimeRepository.find({
      where: { theater: showtimeData.theater },
    });
  
    for (const existingShowtime of existingShowtimes) {
      const existingStartTime = new Date(existingShowtime.start_time);
      const existingEndTime = new Date(existingShowtime.end_time);
  
      if (
        (startTime >= existingStartTime && startTime < existingEndTime) ||
        (endTime > existingStartTime && endTime <= existingEndTime) ||
        (startTime <= existingStartTime && endTime >= existingEndTime)
      ) {
        throw new Error('Overlapping showtimes for the same theater');
      }
    }
  
    // Update showtimeData with Date objects for start_time and end_time
    const showtime = this.showtimeRepository.create({
      ...rest,
      start_time: startTime,  // Convert start_time to Date
      end_time: endTime,      // Convert end_time to Date
    });
  
    return this.showtimeRepository.save(showtime);
  }
  
  

}
