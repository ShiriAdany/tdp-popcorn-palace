import { IsString, IsInt, IsEnum, IsNumber, IsPositive, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsEnum([
    'Action', 
    'Comedy', 
    'Drama', 
    'Horror', 
    'Thriller', 
    'Romance', 
    'Sci-Fi', 
    'Fantasy', 
    'Adventure', 
    'Animation', 
    'Documentary', 
    'Musical'
  ])
  genre: string;

  @IsInt()
  @IsPositive()
  duration: number;  // duration in minutes

  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number; // rating is float in range[0,10]

  @IsInt()
  @Min(1888)  // The first movie was released in 1888
  @Max(new Date().getFullYear())  // Ensures the year is valid- not greater than the current year
  releaseYear: number;
}
