import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Movie } from '../movies/movie.entity';
import { Booking } from '../bookings/booking.entity';
import { Transform } from 'class-transformer';

@Entity()
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Movie, (movie) => movie.showtimes)
  @JoinColumn({ name: 'movieID', referencedColumnName: 'id' })
  movieID: Movie;

  @Column()
  theater: string;

  @Column('timestamp', { precision: 6 })
  start_time: Date;

  @Column('timestamp', { precision: 6 }) 
  end_time: Date;

  @Column('float')
  price: number;

  // One-to-many relationship with Booking
  @OneToMany(() => Booking, (booking) => booking.showtime, { nullable: true })
  bookings?: Booking[];

}
