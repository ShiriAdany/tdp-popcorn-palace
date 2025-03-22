import { IsString, IsEnum, IsInt, IsNumber, IsPositive, Min, Max, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateMovieDto {
  @IsOptional()
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
  genre?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1888)
  @Max(new Date().getFullYear())
  releaseYear?: number;
}
