import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  showtimeId: number;

  @IsInt()
  @Min(1)
  seatNumber: number;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
