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

const validAdminData = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'AdminPass123!',
  role: 'admin'
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
      expect(body.data?.user.newsletter).toBeUndefined();
    });

    it('should create a new user with newsletter subscription', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          newsletter: true
        });

      const body = res.body as ApiResponse<AuthResponse>;

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data?.user.newsletter).toBe(true);
    });

    it('should create a new user without newsletter subscription', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          newsletter: false
        });

      const body = res.body as ApiResponse<AuthResponse>;

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data?.user.newsletter).toBe(false);
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

    it('should return user role in login response', async () => {
      // Create an admin user first
      await User.create(validAdminData);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validAdminData.email,
          password: validAdminData.password
        });

      const body = res.body as ApiResponse<AuthResponse>;

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data?.user.role).toBe('admin');
    });

    it('should return default user role for regular users', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUserData.email,
          password: validUserData.password
        });

      const body = res.body as ApiResponse<AuthResponse>;

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data?.user.role).toBe('user');
    });
  });
}); 