import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hoagie, HoagieDocument } from './schemas/hoagie.schema';
import { CreateHoagieDto } from './dto/create-hoagie.dto';
import { UpdateHoagieDto } from './dto/update-hoagie.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class HoagiesService {
  constructor(
    @InjectModel(Hoagie.name) private hoagieModel: Model<HoagieDocument>,
  ) { }

  async create(createHoagieDto: CreateHoagieDto, userId: string): Promise<any> {
    const hoagie = new this.hoagieModel({
      ...createHoagieDto,
      creator: new Types.ObjectId(userId),
      collaborators: [],
    });

    const savedHoagie = await hoagie.save();
    return this.findById(savedHoagie._id.toString());
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.hoagieModel.aggregate([
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'hoagie',
            as: 'comments',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'creator',
            foreignField: '_id',
            as: 'creatorData',
          },
        },
        {
          $unwind: '$creatorData',
        },
        {
          $project: {
            name: 1,
            ingredients: 1,
            pictureUrl: 1,
            createdAt: 1,
            updatedAt: 1,
            commentCount: { $size: '$comments' },
            creator: {
              id: '$creatorData._id',
              name: '$creatorData.name',
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      this.hoagieModel.countDocuments(),
    ]);

    const formattedData = data.map((hoagie) => ({
      id: hoagie._id.toString(),
      name: hoagie.name,
      ingredients: hoagie.ingredients,
      pictureUrl: hoagie.pictureUrl,
      creator: {
        id: hoagie.creator.id.toString(),
        name: hoagie.creator.name,
      },
      commentCount: hoagie.commentCount,
      createdAt: hoagie.createdAt,
      updatedAt: hoagie.updatedAt,
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

  async findById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Hoagie not found');
    }

    const result = await this.hoagieModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'hoagie',
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creatorData',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'collaborators',
          foreignField: '_id',
          as: 'collaboratorsData',
        },
      },
      {
        $unwind: '$creatorData',
      },
      {
        $project: {
          name: 1,
          ingredients: 1,
          pictureUrl: 1,
          createdAt: 1,
          updatedAt: 1,
          commentCount: { $size: '$comments' },
          creator: {
            id: '$creatorData._id',
            name: '$creatorData.name',
            email: '$creatorData.email',
          },
          collaborators: {
            $map: {
              input: '$collaboratorsData',
              as: 'collab',
              in: {
                id: '$$collab._id',
                name: '$$collab.name',
              },
            },
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      throw new NotFoundException('Hoagie not found');
    }

    const hoagie = result[0];

    return {
      id: hoagie._id.toString(),
      name: hoagie.name,
      ingredients: hoagie.ingredients,
      pictureUrl: hoagie.pictureUrl,
      creator: {
        id: hoagie.creator.id.toString(),
        name: hoagie.creator.name,
        email: hoagie.creator.email,
      },
      collaborators: hoagie.collaborators.map((c: any) => ({
        id: c.id.toString(),
        name: c.name,
      })),
      commentCount: hoagie.commentCount,
      createdAt: hoagie.createdAt,
      updatedAt: hoagie.updatedAt,
    };
  }

  async update(id: string, updateHoagieDto: UpdateHoagieDto, userId: string): Promise<any> {
    const hoagie = await this.hoagieModel.findById(id);

    if (!hoagie) {
      throw new NotFoundException('Hoagie not found');
    }

    const isOwner = hoagie.creator.toString() === userId;
    const isCollaborator = hoagie.collaborators?.some(
      (collaborator) => collaborator.toString() === userId,
    );

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenException('You are not authorized to update this hoagie');
    }

    Object.assign(hoagie, updateHoagieDto);
    await hoagie.save();

    return this.findById(id);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const hoagie = await this.hoagieModel.findById(id);

    if (!hoagie) {
      throw new NotFoundException('Hoagie not found');
    }

    if (hoagie.creator.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to delete this hoagie');
    }

    await this.hoagieModel.findByIdAndDelete(id);

    return { message: 'Hoagie deleted successfully' };
  }

  async addCollaborator(hoagieId: string, userId: string, requestUserId: string): Promise<any> {
    const hoagie = await this.hoagieModel.findById(hoagieId);

    if (!hoagie) {
      throw new NotFoundException('Hoagie not found');
    }

    if (hoagie.creator.toString() !== requestUserId) {
      throw new ForbiddenException('Only the creator can add collaborators');
    }

    if (hoagie.collaborators?.some((id) => id.toString() === userId)) {
      throw new ForbiddenException('User is already a collaborator');
    }

    hoagie.collaborators = hoagie.collaborators || [];
    (hoagie.collaborators as Types.ObjectId[]).push(new Types.ObjectId(userId));
    await hoagie.save();

    return this.findById(hoagieId);
  }

  async removeCollaborator(hoagieId: string, userId: string, requestUserId: string): Promise<{ message: string }> {
    const hoagie = await this.hoagieModel.findById(hoagieId);

    if (!hoagie) {
      throw new NotFoundException('Hoagie not found');
    }

    if (hoagie.creator.toString() !== requestUserId) {
      throw new ForbiddenException('Only the creator can remove collaborators');
    }

    const isCollaborator = hoagie.collaborators?.some(
      (id) => id.toString() === userId,
    );

    if (!isCollaborator) {
      throw new NotFoundException('Collaborator not found');
    }

    hoagie.collaborators = (hoagie.collaborators as Types.ObjectId[])?.filter(
      (id) => id.toString() !== userId,
    ) || [];

    await hoagie.save();

    return { message: 'Collaborator removed successfully' };
  }
}
