import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    searchByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = await module.resolve<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should call usersService.searchByEmail with the correct email', async () => {
      const email = 'test@example.com';
      const expectedResult = [
        { name: 'Test User', email: 'test@example.com', _id: '123' },
      ];
      mockUsersService.searchByEmail.mockResolvedValue(expectedResult);

      const result = await controller.search(email);

      expect(mockUsersService.searchByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedResult);
    });
  });
});
