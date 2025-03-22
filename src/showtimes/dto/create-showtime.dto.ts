import { 
  IsString, 
  IsDateString, 
  IsNumber, 
  IsPositive, 
  IsInt, 
  Min, 
  Length, 
  IsNotEmpty
} from 'class-validator';

export class CreateShowtimeDto {
  @IsInt()
  @Min(1)
  @IsPositive()
  movieID: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)  
  theater: string;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
