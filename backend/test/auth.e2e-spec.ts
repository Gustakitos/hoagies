import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueEmail = `test_${Date.now()}@e2e.com`;
  const password = 'Password123!';

  it('/api/v1/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'E2E User',
        email: uniqueEmail,
        password: password,
      })
      .expect(201)
      .expect((res) => {
        const body = res.body as {
          accessToken: string;
          user: { id: string; email: string };
        };
        expect(body).toHaveProperty('accessToken');
        expect(body.user).toHaveProperty('id');
        expect(body.user.email).toBe(uniqueEmail);
      });
  });

  it('/api/v1/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: password,
      })
      .expect(201)
      .expect((res) => {
        const body = res.body as { accessToken: string };
        expect(body).toHaveProperty('accessToken');
      });
  });
});
