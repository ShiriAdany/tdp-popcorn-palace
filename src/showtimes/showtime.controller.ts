import { Controller, Get,Post, Param,Body, HttpStatus ,Res} from '@nestjs/common';
import { Response } from 'express'; 
import { ShowtimeService } from './showtime.service';
import { Showtime } from './showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';


@Controller('showtimes')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @Get(':id')
  async getShowtimeById(@Param('id') id: number): Promise<Showtime> {
    return this.showtimeService.getShowtimeById(id);
  }


//   @Post()
//   async addShowtime(
//     @Body() createShowtimeDto: CreateShowtimeDto,
//     @Res() res: Response,
//   ): Promise<void> {
//     try {
//       const showtime = await this.showtimeService.addShowtime(createShowtimeDto);
//       res.status(HttpStatus.CREATED).json(showtime);
//     } catch (error) {
//       res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
//     }
//   }



}
