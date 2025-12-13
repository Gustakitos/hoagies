import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCollaboratorDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user to add as collaborator',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
