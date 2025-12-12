import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  _id: 'someId',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword',
};

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
            findByEmail: jest.fn(),
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

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return token', async () => {
      const result = await service.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password123!',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.create).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).toHaveBeenCalled();
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
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.accessToken).toEqual('signed-token');
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      await expect(
        service.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
