import { Injectable, NotFoundException } from '@nestjs/common';
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

//   // Add a showtime
//   async addShowtime(createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
//     const { movieID } = createShowtimeDto;

//     // Check if the movie exists
//     const movie = await this.movieRepository.findOne(movieID);
//     if (!movie) {
//       throw new NotFoundException(`Movie with ID ${movieID} not found`);
//     }

//     const showtime = this.showtimeRepository.create({
//       ...createShowtimeDto,
//       movie, // associate the movie entity with the showtime
//     });

//     return this.showtimeRepository.save(showtime);
//   }


}
