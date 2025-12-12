import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../common/interfaces/request.interface';

@ApiTags('Comments')
@Controller('hoagies/:hoagieId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Get comments for a hoagie' })
  @ApiParam({ name: 'hoagieId', description: 'The ID of the hoagie' })
  @Get()
  async findAll(
    @Param('hoagieId') hoagieId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentsService.findByHoagieId(hoagieId, paginationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a hoagie' })
  @ApiParam({ name: 'hoagieId', description: 'The ID of the hoagie' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('hoagieId') hoagieId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.commentsService.create(
      hoagieId,
      createCommentDto,
      req.user.userId,
    );
  }
}
