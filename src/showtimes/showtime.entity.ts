import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Movie } from '../movies/movie.entity'; 

@Entity()
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Movie, (movie) => movie.showtimes)
  @JoinColumn({ name: 'movieID' })
  movie: Movie;

  @Column()
  theater: string;

  @Column('timestamp')
  start_time: Date;

  @Column('timestamp')
  end_time: Date;

  @Column('decimal', { precision: 5, scale: 2 })
  price: number;
}
