import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './showtime.entity'; // Your Showtime entity
import { CreateShowtimeDto } from './dto/create-showtime.dto'; 
import { UpdateShowtimeDto } from './dto/update-showtime.dto'; 


@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
  ) {}

  
}
