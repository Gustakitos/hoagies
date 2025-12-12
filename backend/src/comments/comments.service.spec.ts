import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getModelToken } from '@nestjs/mongoose';
import { Comment } from './schemas/comment.schema';
import { Hoagie } from '../hoagies/schemas/hoagie.schema';
import { NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

const mockUserId = new Types.ObjectId();
const mockHoagieId = new Types.ObjectId();
const mockCommentId = new Types.ObjectId();

const mockPopulatedComment = {
  _id: mockCommentId,
  text: 'Test comment',
  user: { _id: mockUserId, name: 'User', email: 'u@test.com' },
  hoagie: mockHoagieId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CommentsService', () => {
  let service: CommentsService;
  let commentModel: Model<Comment>;
  let hoagieModel: Model<Hoagie>;

  class MockCommentModel {
    save: jest.Mock;
    constructor(private data: Record<string, unknown>) {
      Object.assign(this, data);
      this.save = jest
        .fn()
        .mockResolvedValue({ _id: mockCommentId, ...this.data });
    }
    static findById = jest.fn();
    static find = jest.fn();
    static countDocuments = jest.fn();
  }

  class MockHoagieModel {
    static findById = jest.fn();
  }

  beforeEach(async () => {
    const commentToken = getModelToken(Comment.name);
    const hoagieToken = getModelToken(Hoagie.name);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: commentToken,
          useValue: MockCommentModel,
        },
        {
          provide: hoagieToken,
          useValue: MockHoagieModel,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentModel = module.get<Model<Comment>>(commentToken);
    hoagieModel = module.get<Model<Hoagie>>(hoagieToken);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment if hoagie exists', async () => {
      const createDto = { text: 'New Comment' };

      (hoagieModel.findById as jest.Mock).mockResolvedValue({
        _id: mockHoagieId,
      });
      const leanMock = jest
        .fn()
        .mockResolvedValue({ ...mockPopulatedComment, text: 'New Comment' });
      const populateMock = jest.fn().mockReturnValue({ lean: leanMock });
      (commentModel.findById as jest.Mock).mockReturnValue({
        populate: populateMock,
      });

      const result = await service.create(
        mockHoagieId.toString(),
        createDto,
        mockUserId.toString(),
      );

      expect(result.text).toEqual(createDto.text);
      expect(result.user.name).toEqual('User');
    });

    it('should throw NotFoundException if hoagie ID is invalid', async () => {
      await expect(
        service.create('invalid-id', { text: 'c' }, 'uid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if hoagie not found', async () => {
      (hoagieModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.create(mockHoagieId.toString(), { text: 'c' }, 'uid'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByHoagieId', () => {
    it('should return paginated comments', async () => {
      const leanMock = jest.fn().mockResolvedValue([mockPopulatedComment]);
      const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      const populateMock = jest.fn().mockReturnValue({ sort: sortMock });

      (commentModel.find as jest.Mock).mockReturnValue({
        populate: populateMock,
      });
      (commentModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await service.findByHoagieId(mockHoagieId.toString(), {
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(1);
    });

    it('should throw NotFoundException if hoagie ID is invalid', async () => {
      await expect(service.findByHoagieId('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
