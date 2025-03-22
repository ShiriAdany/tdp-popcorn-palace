import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieModule } from './movies/movie.module';
import { Movie } from './movies/movie.entity';
import { ShowtimeModule } from './showtimes/showtime.module';
import { Showtime } from './showtimes/showtime.entity';
import { BookingModule } from './bookings/booking.module';
 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,       // Use the DB host from environment variable
      port: +process.env.DB_PORT,      // Convert port to number
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,   
      entities: [Movie,Showtime],
    }),
    MovieModule,
    ShowtimeModule,
    BookingModule
  ],
})
export class AppModule {}
