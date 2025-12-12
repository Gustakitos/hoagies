import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This hoagie looks delicious!',
    description: 'The text content of the comment',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  text: string;
}
