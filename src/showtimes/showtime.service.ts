import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './showtime.entity';
import { Movie } from '../movies/movie.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';

@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime)
    private showtimeRepository: Repository<Showtime>,

    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>, // Inject MovieRepository
  ) {}

  // Get a showtime by ID
  async getShowtimeById(id: number): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findOne({ where: { id } });

    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }

    return showtime;
  }

  // Validate showtime times
  private async validateShowtimeTimes(start_time: string, end_time: string, theater: string, excludeShowtimeId?: number) {
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    if (startTime > endTime) {
      throw new BadRequestException('Start time cannot be after end time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Start time cannot be in the past');
    }

    if (startTime.getTime() === endTime.getTime()) {
      throw new BadRequestException('Start time cannot be the same as end time');
    }

    // Check for overlapping showtimes in the same theater
    const existingShowtimes = await this.showtimeRepository.find({ where: { theater } });

    for (const existingShowtime of existingShowtimes) {
      if (excludeShowtimeId && existingShowtime.id === excludeShowtimeId) {
        continue; // Skip the current showtime if updating
      }

      const existingStartTime = new Date(existingShowtime.start_time);
      const existingEndTime = new Date(existingShowtime.end_time);

      if (
        (startTime >= existingStartTime && startTime < existingEndTime) ||
        (endTime > existingStartTime && endTime <= existingEndTime) ||
        (startTime <= existingStartTime && endTime >= existingEndTime)
      ) {
        throw new BadRequestException('Overlapping showtimes for the same theater');
      }
    }

    return { startTime, endTime };
  }

  // Add a new showtime
  async addShowtime(showtimeData: CreateShowtimeDto): Promise<Showtime> {
    const { movieID, start_time, end_time, theater, ...rest } = showtimeData;

    // Check if the movie exists
    const movieEntity = await this.movieRepository.findOne({ where: { id: movieID } });
    if (!movieEntity) {
      throw new NotFoundException(`Movie with ID ${movieID} not found`);
    }

    // Validate times
    const { startTime, endTime } = await this.validateShowtimeTimes(start_time, end_time, theater);

    const showtime = this.showtimeRepository.create({
      ...rest,
      start_time: startTime,
      end_time: endTime,
    });

    return this.showtimeRepository.save(showtime);
  }

  // Update an existing showtime
  async updateShowtime(showtimeId: number, updateDto: UpdateShowtimeDto): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } });

    if (!showtime) {
        throw new NotFoundException(`Showtime with ID ${showtimeId} not found`);
    }

    const { startTime, endTime, theater } = updateDto;

    // Validate times if startTime or endTime is being updated
    if (startTime || endTime) {
        const { startTime: validatedStartTime, endTime: validatedEndTime } = await this.validateShowtimeTimes(
            startTime || showtime.start_time.toISOString(),
            endTime || showtime.end_time.toISOString(),
            theater || showtime.theater,
            showtimeId
        );

        updateDto.startTime = validatedStartTime.toISOString();
        updateDto.endTime = validatedEndTime.toISOString();
    }

    Object.assign(showtime, updateDto);
    return this.showtimeRepository.save(showtime);
  }



   // Delete a showtime by ID
   async deleteShowtime(showtimeId: number): Promise<void> {
    const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } });
  
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${showtimeId} not found`);
    }
  
    const deleteResult = await this.showtimeRepository.delete(showtimeId);
  
    if (deleteResult.affected === 0) {
      throw new Error('Failed to delete showtime');
    }
  }
  


}
