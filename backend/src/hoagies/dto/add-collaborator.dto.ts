import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCollaboratorDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email of the user to add as collaborator',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
