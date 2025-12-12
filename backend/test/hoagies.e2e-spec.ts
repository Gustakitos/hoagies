import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('HoagiesController (e2e)', () => {
  let app: INestApplication;
  let userAToken: string;
  let userBToken: string;
  let userBId: string;
  let hoagieId: string;

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

  const unique = Date.now();
  const userA = {
    name: 'User A',
    email: `a_${unique}@test.com`,
    password: 'Password123!',
  };
  const userB = {
    name: 'User B',
    email: `b_${unique}@test.com`,
    password: 'Password123!',
  };

  it('should register User A', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(userA)
      .expect(201);

    const body = res.body as { accessToken: string; user: { id: string } };
    userAToken = body.accessToken;
  });

  it('should register User B', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(userB)
      .expect(201);

    const body = res.body as { accessToken: string; user: { id: string } };
    userBToken = body.accessToken;
    userBId = body.user.id;
  });

  it('/api/v1/hoagies (POST) - Create Hoagie as User A', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/hoagies')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'The Original',
        ingredients: ['ham', 'cheese', 'lettuce'],
        pictureUrl: 'http://example.com/pic.jpg',
      })
      .expect(201);

    const body = res.body as { id: string; name: string };
    hoagieId = body.id;
    expect(body.name).toBe('The Original');
  });

  it('/api/v1/hoagies/:id (PUT) - User B should NOT be able to update', () => {
    return request(app.getHttpServer())
      .put(`/api/v1/hoagies/${hoagieId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ name: 'Hacked Hoagie' })
      .expect(403);
  });

  it('/api/v1/hoagies/:id/collaborators (POST) - Add User B as collaborator', () => {
    return request(app.getHttpServer())
      .post(`/api/v1/hoagies/${hoagieId}/collaborators`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ userId: userBId })
      .expect(201);
  });

  it('/api/v1/hoagies/:id (PUT) - User B SHOULD be able to update now', () => {
    return request(app.getHttpServer())
      .put(`/api/v1/hoagies/${hoagieId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ name: 'Collaborative Hoagie' })
      .expect(200);
  });

  it('/api/v1/hoagies/:id/collaborators/:userId (DELETE) - Remove User B', () => {
    return request(app.getHttpServer())
      .delete(`/api/v1/hoagies/${hoagieId}/collaborators/${userBId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);
  });

  it('/api/v1/hoagies/:id (DELETE) - User A deletes Hoagie', () => {
    return request(app.getHttpServer())
      .delete(`/api/v1/hoagies/${hoagieId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);
  });
});
