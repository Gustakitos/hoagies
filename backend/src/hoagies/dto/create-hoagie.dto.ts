import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUrl,
  IsOptional,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHoagieDto {
  @ApiProperty({
    example: 'Brazilian Burger',
    description: 'The name of the hoagie',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: ['ham', 'cheese', 'lettuce'],
    description: 'List of ingredients',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  ingredients: string[];

  @ApiProperty({
    example: 'https://example.com/hoagie.jpg',
    description: 'URL to a picture of the hoagie',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  pictureUrl?: string;
}
