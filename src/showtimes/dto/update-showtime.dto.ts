import { IsOptional, IsString, IsDateString, IsNumber, IsPositive, IsInt, Min, Length } from 'class-validator';

export class UpdateShowtimeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  movieId?: number;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  theater?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;
}
