import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Hoagie, HoagieDocument } from '../hoagies/schemas/hoagie.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { User } from 'src/users/schema/user.schema';

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
  ): Promise<any> {
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
      .populate('user', 'name email')
      .lean();

    return {
      id: populatedComment?._id.toString(),
      text: populatedComment?.text,
      user: {
        id: (populatedComment?.user as Types.ObjectId)?._id.toString(),
        name: (populatedComment?.user as User)?.name,
      },
      hoagie: populatedComment?.hoagie.toString(),
      createdAt: populatedComment?.createdAt,
      updatedAt: populatedComment?.updatedAt,
    };
  }

  async findByHoagieId(
    hoagieId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    if (!Types.ObjectId.isValid(hoagieId)) {
      throw new NotFoundException('Hoagie not found');
    }

    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.commentModel
        .find({ hoagie: new Types.ObjectId(hoagieId) })
        .populate('user', 'name email')
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
        id: (comment.user as any)._id.toString(),
        name: (comment.user as any).name,
      },
      hoagie: comment.hoagie.toString(),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
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
