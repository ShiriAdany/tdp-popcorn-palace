import { Controller } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';

@Controller('showtimes')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

}
