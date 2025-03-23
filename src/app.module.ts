import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieModule } from './movies/movie.module';
import { Movie } from './movies/movie.entity';
import { ShowtimeModule } from './showtimes/showtime.module';
import { Showtime } from './showtimes/showtime.entity';
import { BookingModule } from './bookings/booking.module';
import { AppController } from './app.controller';  
import { AppService } from './app.service';  

import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
      entities: [Movie, Showtime],
    }),
    MovieModule,
    ShowtimeModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}