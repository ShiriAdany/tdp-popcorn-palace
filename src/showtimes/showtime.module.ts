import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showtime } from './showtime.entity';
import { ShowtimeService } from './showtime.service';
import { ShowtimeController } from './showtime.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Showtime])],
  controllers: [ShowtimeController],
  providers: [ShowtimeService],
})
export class ShowtimeModule {}
