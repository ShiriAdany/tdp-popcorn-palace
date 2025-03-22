  import { Entity, PrimaryGeneratedColumn, Column,Unique } from 'typeorm';

  @Entity()
  @Unique(['title'])  // Movie title is unique
  export class Movie {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    genre: string;

    @Column()
    duration: number; // In minutes

    @Column('decimal', { precision: 3, scale: 1 })
    rating: number;

    @Column()
    releaseYear: number;
  }
