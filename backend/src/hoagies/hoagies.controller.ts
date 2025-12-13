import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HoagiesService } from './hoagies.service';
import { CreateHoagieDto } from './dto/create-hoagie.dto';
import { UpdateHoagieDto } from './dto/update-hoagie.dto';
import { AddCollaboratorDto } from './dto/add-collaborator.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../common/interfaces/request.interface';

@ApiTags('Hoagies')
@Controller('hoagies')
export class HoagiesController {
  constructor(private hoagiesService: HoagiesService) {}

  @ApiOperation({ summary: 'Get all hoagies' })
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.hoagiesService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get a hoagie by id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.hoagiesService.findById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new hoagie' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createHoagieDto: CreateHoagieDto,
    @Request() req: RequestWithUser,
  ) {
    return this.hoagiesService.create(createHoagieDto, req.user.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a hoagie' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateHoagieDto: UpdateHoagieDto,
    @Request() req: RequestWithUser,
  ) {
    return this.hoagiesService.update(id, updateHoagieDto, req.user.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a hoagie' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.hoagiesService.delete(id, req.user.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a collaborator to a hoagie' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/collaborators')
  async addCollaborator(
    @Param('id') id: string,
    @Body() addCollaboratorDto: AddCollaboratorDto,
    @Request() req: RequestWithUser,
  ) {
    return this.hoagiesService.addCollaborator(
      id,
      addCollaboratorDto.email,
      req.user.userId,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a collaborator from a hoagie' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/collaborators/:userId')
  async removeCollaborator(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.hoagiesService.removeCollaborator(id, userId, req.user.userId);
  }
}
