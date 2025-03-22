import { Entity, PrimaryGeneratedColumn, Column, Unique, BeforeInsert } from 'typeorm';

@Entity()
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movie: string;

  @Column()
  theater: string;

  @Column('timestamp')
  start_time: Date;

  @Column('timestamp')
  end_time: Date;

  @Column('decimal', { precision: 5, scale: 2 })
  price: number;

}