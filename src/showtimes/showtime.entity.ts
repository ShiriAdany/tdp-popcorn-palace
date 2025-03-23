import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Movie } from '../movies/movie.entity';
import { Booking } from '../bookings/booking.entity';
import { Expose, Transform } from 'class-transformer';

@Entity()
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  price: number;

  @ManyToOne(() => Movie, (movie) => movie.showtimes)
  @JoinColumn({ name: 'movieId', referencedColumnName: 'id' })
  movieID: Movie;

  @Column()
  theater: string;

  @Column()
  startTime: string;

  @Column() 
  endTime: string;



  // One-to-many relationship with Booking
  @OneToMany(() => Booking, (booking) => booking.showtime, { nullable: true })
  bookings?: Booking[];

  // @Expose({ name: 'movieID' })
  // @Transform(({ value }) => value.id)  
  // get movieId(): number {
  //   return this.movieID ? this.movieID.id : null;
  // }

}
