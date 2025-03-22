import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Movie } from '../movies/movie.entity'; 
import { Booking } from '../bookings/booking.entity';

@Entity()
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Movie, (movie) => movie.showtimes)
  @JoinColumn({ name: 'movieID', referencedColumnName: 'id' })
  movieID: Movie;

  @Column()
  theater: string;

  @Column('timestamp')
  start_time: Date;

  @Column('timestamp')
  end_time: Date;

  @Column('decimal', { precision: 5, scale: 2 })
  price: number;

  // One-to-many relationship with Booking
  @OneToMany(() => Booking, (booking) => booking.showtime,{ nullable: true })
  bookings?: Booking[];
  
}
