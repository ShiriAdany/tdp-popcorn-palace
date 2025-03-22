// create-showtime.dto.ts
import { IsString, IsDateString, IsDecimal, Min, Max, IsInt } from 'class-validator';

export class CreateShowtimeDto {
  @IsInt()
  @Min(1)
  movie: number;

  @IsString()
  @Min(1)
  @Max(255)
  theater: string;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;

  @IsDecimal()
  @Min(0)
  price: number;
}
