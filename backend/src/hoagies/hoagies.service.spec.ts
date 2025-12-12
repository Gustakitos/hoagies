import { Test, TestingModule } from '@nestjs/testing';
import { HoagiesService } from './hoagies.service';
import { getModelToken } from '@nestjs/mongoose';
import { Hoagie } from './schemas/hoagie.schema';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockUserId = new Types.ObjectId();
const mockHoagieId = new Types.ObjectId();

const mockHoagie = {
  _id: mockHoagieId,
  name: 'Test Hoagie',
  ingredients: ['ham'],
  creator: mockUserId,
  collaborators: [],
  save: jest.fn(),
};

const mockAggregateResult = [
  {
    id: mockHoagieId.toString(),
    name: mockHoagie.name,
    ingredients: mockHoagie.ingredients,
    creator: {
      id: mockUserId.toString(),
      name: 'Creator',
      email: 'c@test.com',
    },
    collaborators: [],
    commentCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('HoagiesService', () => {
  let service: HoagiesService;
  let model: any;

  class MockHoagieModel {
    save: any;
    constructor(private data: any) {
      Object.assign(this, data);
      this.save = jest
        .fn()
        .mockResolvedValue({ _id: new Types.ObjectId(), ...this.data });
    }
    static find = jest.fn();
    static findOne = jest.fn();
    static findById = jest.fn();
    static findByIdAndDelete = jest.fn();
    static create = jest.fn();
    static aggregate = jest.fn();
    static countDocuments = jest.fn();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoagiesService,
        {
          provide: getModelToken(Hoagie.name),
          useValue: MockHoagieModel,
        },
      ],
    }).compile();

    service = module.get<HoagiesService>(HoagiesService);
    model = module.get(getModelToken(Hoagie.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a hoagie', async () => {
      const createDto = { name: 'New Hoagie', ingredients: ['bread'] };

      model.aggregate.mockResolvedValue(mockAggregateResult);

      jest.spyOn(service, 'findById').mockResolvedValue(mockAggregateResult[0]);

      const result = await service.create(createDto, mockUserId.toString());

      expect(result).toEqual(mockAggregateResult[0]);
      expect(service.findById).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated hoagies', async () => {
      model.aggregate.mockResolvedValue([
        {
          _id: mockHoagieId,
          name: 'Hoagie',
          ingredients: [],
          pictureUrl: '',
          creator: { id: mockUserId, name: 'C' },
          commentCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      model.countDocuments.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a hoagie if found', async () => {
      model.aggregate.mockResolvedValue(mockAggregateResult);

      model.aggregate.mockResolvedValue([
        {
          _id: mockHoagieId,
          name: mockHoagie.name,
          ingredients: mockHoagie.ingredients,
          creator: { id: mockUserId, name: 'Creator', email: 'e' },
          collaborators: [],
          commentCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await service.findById(mockHoagieId.toString());
      expect(result.id).toEqual(mockHoagieId.toString());
    });

    it('should throw NotFoundException if invalid ID', async () => {
      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if not found', async () => {
      model.aggregate.mockResolvedValue([]);
      await expect(service.findById(mockHoagieId.toString())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update hoagie if owner', async () => {
      model.findById.mockResolvedValue({
        ...mockHoagie,
        creator: mockUserId,
        collaborators: [],
        save: jest.fn(),
      });
      jest.spyOn(service, 'findById').mockResolvedValue(mockAggregateResult[0]);

      const result = await service.update(
        mockHoagieId.toString(),
        { name: 'Updated' },
        mockUserId.toString(),
      );
      expect(service.findById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not owner or collaborator', async () => {
      model.findById.mockResolvedValue({
        ...mockHoagie,
        creator: new Types.ObjectId(),
        collaborators: [],
      });

      await expect(
        service.update(mockHoagieId.toString(), {}, mockUserId.toString()),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if hoagie not found', async () => {
      model.findById.mockResolvedValue(null);

      await expect(
        service.update(mockHoagieId.toString(), {}, mockUserId.toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete hoagie if owner', async () => {
      model.findById.mockResolvedValue({
        ...mockHoagie,
        creator: mockUserId,
      });

      await service.delete(mockHoagieId.toString(), mockUserId.toString());
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(
        mockHoagieId.toString(),
      );
    });

    it('should throw NotFoundException if hoagie not found', async () => {
      model.findById.mockResolvedValue(null);
      await expect(
        service.delete(mockHoagieId.toString(), mockUserId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      model.findById.mockResolvedValue({
        ...mockHoagie,
        creator: new Types.ObjectId(),
      });
      await expect(
        service.delete(mockHoagieId.toString(), mockUserId.toString()),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addCollaborator', () => {
    it('should add collaborator if owner', async () => {
      const newCollabId = new Types.ObjectId();
      const saveMock = jest.fn();
      model.findById.mockResolvedValue({
        ...mockHoagie,
        creator: mockUserId,
        collaborators: [],
        save: saveMock,
      });
      jest.spyOn(service, 'findById').mockResolvedValue(mockAggregateResult[0]);

      await service.addCollaborator(
        mockHoagieId.toString(),
        newCollabId.toString(),
        mockUserId.toString(),
      );

      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw NotFoundException if hoagie not found', async () => {
      model.findById.mockResolvedValue(null);
      await expect(
        service.addCollaborator(
          mockHoagieId.toString(),
          'userId',
          mockUserId.toString(),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      model.findById.mockResolvedValue({
        ...mockHoagie,
        creator: new Types.ObjectId(),
      });
      await expect(
        service.addCollaborator(
          mockHoagieId.toString(),
          'userId',
          mockUserId.toString(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if already collaborator', async () => {
      const collabId = new Types.ObjectId();
      model.findById.mockResolvedValue({
        ...mockHoagie,
        creator: mockUserId,
        collaborators: [collabId],
      });
      await expect(
        service.addCollaborator(
          mockHoagieId.toString(),
          collabId.toString(),
          mockUserId.toString(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeCollaborator', () => {
    it('should remove collaborator if owner', async () => {
      const collabId = new Types.ObjectId();
      const saveMock = jest.fn();
      model.findById.mockResolvedValue({
        ...mockHoagie,
        creator: mockUserId,
        collaborators: [collabId],
        save: saveMock,
      });

      await service.removeCollaborator(
        mockHoagieId.toString(),
        collabId.toString(),
        mockUserId.toString(),
      );

      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw NotFoundException if hoagie not found', async () => {
      model.findById.mockResolvedValue(null);
      await expect(
        service.removeCollaborator(
          mockHoagieId.toString(),
          'userId',
          mockUserId.toString(),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      model.findById.mockResolvedValue({
        ...mockHoagie,
        creator: new Types.ObjectId(),
      });
      await expect(
        service.removeCollaborator(
          mockHoagieId.toString(),
          'userId',
          mockUserId.toString(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if collaborator not found', async () => {
      model.findById.mockResolvedValue({
        ...mockHoagie,
        creator: mockUserId,
        collaborators: [],
      });
      await expect(
        service.removeCollaborator(
          mockHoagieId.toString(),
          'userId',
          mockUserId.toString(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
