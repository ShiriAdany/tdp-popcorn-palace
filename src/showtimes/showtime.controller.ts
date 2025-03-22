import { Controller, Get, Param } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { Showtime } from './showtime.entity';

@Controller('showtimes')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @Get(':id')
  async getShowtimeById(@Param('id') id: number): Promise<Showtime> {
    return this.showtimeService.getShowtimeById(id);
  }
}
