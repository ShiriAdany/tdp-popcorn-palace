import { Controller, Get,Post, Param,Body, HttpStatus ,Res, ParseIntPipe, Delete} from '@nestjs/common';
import { Response } from 'express'; 
import { ShowtimeService } from './showtime.service';
import { Showtime } from './showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';



@Controller('showtimes')
export class ShowtimeController {
    constructor(private readonly showtimeService: ShowtimeService) {}

    // HTTP GET endpoint to get a showtime by id
    @Get(':id')
    async getShowtimeById(@Param('id') id: number): Promise<Showtime> {
        return this.showtimeService.getShowtimeById(id);
    }


    // HTTP POST endpoint to add a showtime
    @Post()
    async addShowtime(@Body() createShowtimeDto: CreateShowtimeDto, @Res() res: Response,){
        try {
        const showtime = await this.showtimeService.addShowtime(createShowtimeDto);
        return res.status(HttpStatus.OK).json(showtime);
        } catch (error) {
          const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
          res.status(status).json({
          message: error.message || 'Unexpected error',
           });
        }
    }

    // HTTP POST endpoint to update a showtime by id
    @Post('update/:showtimeId') 
    async updateShowtime(@Param('showtimeId', ParseIntPipe) showtimeId: number, @Body() updateData: UpdateShowtimeDto,@Res() res:Response) {
        try{
            const showtime = await this.showtimeService.updateShowtime(showtimeId, updateData)
            res.status(HttpStatus.OK).json(showtime)
        } catch(error){
          const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
          res.status(status).json({
          message: error.message || 'Unexpected error',
           });
        }
    }


    // HTTP DELETE endpoint to delete a showtime by id
    @Delete(':showtimeId')
    async deleteShowtime(@Param('showtimeId') showtimeId: number, @Res() res: Response): Promise<void> {
    try {
      // Call the service to delete the showtime
      await this.showtimeService.deleteShowtime(showtimeId);
      res.status(HttpStatus.OK).send({ message: 'Showtime deleted successfully' }); 
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
          res.status(status).json({
          message: error.message || 'Unexpected error',
           });
    }
  }



}
