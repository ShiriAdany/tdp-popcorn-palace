import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Showtime } from '../showtimes/showtime.entity';  

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  showtimeId: number;

  @Column()
  seatNumber: number;

  @Column()
  userId: string;

  // Many-to-One relationship to Showtime entity- can be many bookings to one showtime
  @ManyToOne(() => Showtime, (showtime) => showtime.bookings)
  @JoinColumn({ name: 'showtimeId', referencedColumnName: 'id' })
  showtime: Showtime;
}