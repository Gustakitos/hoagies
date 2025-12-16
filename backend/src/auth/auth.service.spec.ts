import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserDocument } from '../users/schema/user.schema';

const mockUser = {
  _id: 'someId',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword',
} as unknown as UserDocument;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findOneByEmail: jest.fn(),
            validatePassword: jest.fn(),
            findById: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-token'),
          },
        },
      ],
    }).compile();

    service = await module.resolve<AuthService>(AuthService);
    usersService = await module.resolve<UsersService>(UsersService);
    jwtService = await module.resolve<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return token', async () => {
      const createSpy = jest.spyOn(usersService, 'create');
      const SignSpy = jest.spyOn(jwtService, 'sign');

      const result = await service.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(createSpy).toHaveBeenCalled();
      expect(SignSpy).toHaveBeenCalled();
      expect(result).toEqual({
        user: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
        },
        accessToken: 'signed-token',
      });
    });
  });

  describe('login', () => {
    it('should return token for valid user', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.accessToken).toEqual('signed-token');
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      await expect(
        service.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
