import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCollaboratorDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'The ID of the user to add as collaborator',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
