import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Hoagie, HoagieDocument } from '../hoagies/schemas/hoagie.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import {
  CommentResponse,
  PopulatedUser,
} from 'src/common/interfaces/comments.interface';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Hoagie.name) private hoagieModel: Model<HoagieDocument>,
  ) {}

  async create(
    hoagieId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentResponse> {
    if (!Types.ObjectId.isValid(hoagieId)) {
      throw new NotFoundException('Hoagie not found');
    }

    const hoagie = await this.hoagieModel.findById(hoagieId);
    if (!hoagie) {
      throw new NotFoundException('Hoagie not found');
    }

    const comment = new this.commentModel({
      text: createCommentDto.text,
      user: new Types.ObjectId(userId),
      hoagie: new Types.ObjectId(hoagieId),
    });

    const savedComment = await comment.save();

    const populatedComment = await this.commentModel
      .findById(savedComment._id)
      .populate<{ user: PopulatedUser }>('user', 'name email')
      .lean();

    if (!populatedComment) {
      throw new NotFoundException('Comment not found after creation');
    }

    return {
      id: populatedComment._id.toString(),
      text: populatedComment.text,
      user: {
        id: populatedComment.user._id.toString(),
        name: populatedComment.user.name,
      },
      hoagie: (populatedComment.hoagie as Types.ObjectId).toString(),
      createdAt: populatedComment.createdAt ?? new Date(),
      updatedAt: populatedComment.updatedAt ?? new Date(),
    };
  }

  async findByHoagieId(
    hoagieId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<CommentResponse>> {
    if (!Types.ObjectId.isValid(hoagieId)) {
      throw new NotFoundException('Hoagie not found');
    }

    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.commentModel
        .find({ hoagie: new Types.ObjectId(hoagieId) })
        .populate<{ user: PopulatedUser }>('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.commentModel.countDocuments({
        hoagie: new Types.ObjectId(hoagieId),
      }),
    ]);

    const formattedData = comments.map((comment) => ({
      id: comment._id.toString(),
      text: comment.text,
      user: {
        id: comment.user._id.toString(),
        name: comment.user.name,
      },
      hoagie: (comment.hoagie as Types.ObjectId).toString(),
      createdAt: comment.createdAt ?? new Date(),
      updatedAt: comment.updatedAt ?? new Date(),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
