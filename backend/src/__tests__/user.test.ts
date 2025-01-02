import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../index';
import { User, IUser } from '../models/User';
import { config } from '../config/test.config';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';

describe('User Endpoints', () => {
  let authToken: string;
  let userId: string;

  const makeRequest = (method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any) => {
    const req = request(app)[method](url);
    if (authToken) req.set('Authorization', `Bearer ${authToken}`);
    if (data) req.send(data);
    return req;
  };

  const expectError = async (method: 'get' | 'post' | 'put' | 'delete', url: string, status: number, message: string, data?: any) => {
    const res = await makeRequest(method, url, data);
    expect(res.status).toBe(status);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(message);
    return res;
  };

  beforeAll(async () => await mongoose.connect(config.mongodb.uri));
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'ValidPass123!'
    }) as IUser;
    userId = user.id;
    authToken = jwt.sign({ userId }, JWT_CONFIG.secret);
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await makeRequest('get', '/api/users/profile');
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        email: 'test@example.com',
        username: 'testuser'
      });
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should not get profile without token', async () => {
      authToken = '';
      await expectError('get', '/api/users/profile', 401, 'Non autorisé');
    });
  });

  describe('PUT /api/users/profile', () => {
    const validUpdate = {
      newsletter: false,
      fullName: { firstName: 'John', familyName: 'Doe', gender: 'male' },
      birthDate: '1990-01-01',
      mobilePhone: '+971501234567',
      address: { city: 'Dubai', emirate: 'DU', poBox: '12345' }
    };

    it('should update all optional fields', async () => {
      const res = await makeRequest('put', '/api/users/profile', validUpdate);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(validUpdate);
    });

    it('should allow partial updates', async () => {
      const partial = { newsletter: false, mobilePhone: '+971501234567' };
      const res = await makeRequest('put', '/api/users/profile', partial);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject(partial);
    });

    describe('validation', () => {
      const invalidCases = [
        {
          data: { fullName: { firstName: 'J', gender: 'invalid' } },
          status: 400,
          message: 'Format de prénom invalide'
        },
        {
          data: { address: { emirate: 'INVALID', poBox: 'ABC' } },
          status: 400,
          message: 'Format d\'adresse invalide'
        },
        {
          data: { mobilePhone: 'invalid-format' },
          status: 400,
          message: 'Format de numéro de mobile invalide'
        },
        {
          data: { birthDate: 'invalid-date' },
          status: 400,
          message: 'Format de date de naissance invalide'
        }
      ];

      test.each(invalidCases)('should validate $data', async ({ data, status, message }) => {
        await expectError('put', '/api/users/profile', status, message, data);
      });
    });

    it('should merge updates correctly', async () => {
      await makeRequest('put', '/api/users/profile', {
        fullName: { firstName: 'John' },
        address: { city: 'Dubai' }
      });

      const res = await makeRequest('put', '/api/users/profile', {
        fullName: { familyName: 'Doe' },
        address: { emirate: 'DU' }
      });

      expect(res.status).toBe(200);
      expect(res.body.data.fullName).toMatchObject({
        firstName: 'John',
        familyName: 'Doe'
      });
      expect(res.body.data.address).toMatchObject({
        city: 'Dubai',
        emirate: 'DU'
      });
    });
  });

  describe('credentials update', () => {
    it('should update username', async () => {
      const res = await makeRequest('put', '/api/users/profile/username', { username: 'newusername' });
      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe('newusername');
    });

    it('should update email', async () => {
      const res = await makeRequest('put', '/api/users/profile/email', { email: 'new@example.com' });
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('new@example.com');
    });

    it('should update password', async () => {
      const res = await makeRequest('put', '/api/users/profile/password', {
        currentPassword: 'ValidPass123!',
        newPassword: 'NewValidPass456!'
      });
      expect(res.status).toBe(200);
    });

    it('should delete profile', async () => {
      const res = await makeRequest('delete', '/api/users/profile', { password: 'ValidPass123!' });
      expect(res.status).toBe(200);
      expect(await User.findById(userId)).toBeNull();
    });
  });
}); 