import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../index';
import { User } from '../models/User';
import { config } from '../config/test.config';
import { ApiResponse, AuthResponse } from '../types/api';

const validUserData = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'ValidPass123!'
};

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongodb.uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      const body = res.body as ApiResponse<AuthResponse>;

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Inscription réussie');
      expect(body.data).toBeDefined();
      expect(body.data?.token).toBeDefined();
      expect(body.data?.user).toMatchObject({
        username: validUserData.username,
        email: validUserData.email
      });
    });

    it('should not create user with existing email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          username: 'testuser2'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Utilisateur déjà existant');
    });

    it('should not create user with existing username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          email: 'test2@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Utilisateur déjà existant');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Username, email et mot de passe sont requis');
    });

    it('should validate input formats', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'test@user',
          email: 'invalid-email',
          password: 'weak'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Données d\'inscription invalides');
      expect(res.body.errors).toHaveLength(3);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(validUserData);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUserData.email,
          password: validUserData.password
        });

      const body = res.body as ApiResponse<AuthResponse>;

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Connexion réussie');
      expect(body.data?.token).toBeDefined();
      expect(body.data?.user).toMatchObject({
        username: validUserData.username,
        email: validUserData.email
      });
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUserData.email,
          password: 'WrongPass123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email ou mot de passe incorrect');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: validUserData.password
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email ou mot de passe incorrect');
    });

    it('should require email and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email et mot de passe requis');
    });
  });
}); 