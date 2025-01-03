import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../index';
import { User, IUser } from '../models/User';
import { Newsletter } from '../models/Newsletter';
import { config } from '../config/test.config';
import { ApiResponse } from '../types/api';

// Mock nodemailer
jest.mock('nodemailer', () => require('./mocks/nodemailer').default);

const adminUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'admin',
  email: 'admin@example.com',
  password: 'AdminPass123!',
  role: 'admin',
  newsletter: false // Admin non inscrit à la newsletter
} as IUser;

const regularUser = {
  username: 'user',
  email: 'user@example.com',
  password: 'UserPass123!',
  role: 'user',
  newsletter: true // Utilisateur inscrit à la newsletter
};

describe('Admin Routes', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await mongoose.connect(config.mongodb.uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Nettoyer les collections
    await User.deleteMany({});
    await Newsletter.deleteMany({});

    // Créer les utilisateurs de test
    await User.create(adminUser);
    await User.create(regularUser);

    // Obtenir les tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.data?.token;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: regularUser.email, password: regularUser.password });
    userToken = userLogin.body.data?.token;

    // Nettoyer les mocks
    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should allow admin to get all users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const body = res.body as ApiResponse<any[]>;

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data?.length).toBe(2);
      expect(body.data?.[0]).not.toHaveProperty('password');
    });

    it('should not allow regular user to get all users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      const body = res.body as ApiResponse<null>;

      expect(res.status).toBe(403);
      expect(body.success).toBe(false);
    });
  });

  describe('POST /api/admin/newsletter', () => {
    const validNewsletter = {
      subject: 'Test Newsletter',
      content: 'Test content'
    };

    it('should allow admin to send newsletter', async () => {
      const res = await request(app)
        .post('/api/admin/newsletter')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validNewsletter);

      const body = res.body as ApiResponse<{ recipientCount: number }>;

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data?.recipientCount).toBe(1); // Seul regularUser est inscrit

      // Vérifier que la newsletter a été sauvegardée
      const savedNewsletter = await Newsletter.findOne({ subject: validNewsletter.subject });
      expect(savedNewsletter).toBeDefined();
      expect(savedNewsletter?.recipients).toContain(regularUser.email);
    });

    it('should not allow regular user to send newsletter', async () => {
      const res = await request(app)
        .post('/api/admin/newsletter')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validNewsletter);

      const body = res.body as ApiResponse<null>;

      expect(res.status).toBe(403);
      expect(body.success).toBe(false);
    });

    it('should validate newsletter content', async () => {
      const res = await request(app)
        .post('/api/admin/newsletter')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      const body = res.body as ApiResponse<null>;

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Subject and content are required');
    });

    it('should handle case with no subscribers', async () => {
      // Désinscrire tous les utilisateurs
      await User.updateMany({}, { newsletter: false });

      const res = await request(app)
        .post('/api/admin/newsletter')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validNewsletter);

      const body = res.body as ApiResponse<null>;

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Aucun utilisateur inscrit à la newsletter');
    });
  });

  describe('GET /api/admin/newsletter/history', () => {
    beforeEach(async () => {
      // Créer quelques newsletters de test
      const newsletters = Array.from({ length: 15 }, (_, i) => ({
        subject: `Newsletter ${i + 1}`,
        content: `Content ${i + 1}`,
        sentBy: adminUser._id,
        recipientCount: 1,
        recipients: [regularUser.email]
      }));

      await Newsletter.insertMany(newsletters);
    });

    it('should return paginated newsletter history', async () => {
      const res = await request(app)
        .get('/api/admin/newsletter/history')
        .set('Authorization', `Bearer ${adminToken}`);

      const body = res.body as ApiResponse<{
        newsletters: any[];
        pagination: { total: number; page: number; pages: number };
      }>;

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data?.newsletters).toHaveLength(10); // Limite par défaut
      expect(body.data?.pagination.total).toBe(15);
      expect(body.data?.pagination.pages).toBe(2);
    });

    it('should handle custom pagination', async () => {
      const res = await request(app)
        .get('/api/admin/newsletter/history?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      const body = res.body as ApiResponse<{
        newsletters: any[];
        pagination: { total: number; page: number; pages: number };
      }>;

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data?.newsletters).toHaveLength(5);
      expect(body.data?.pagination.page).toBe(2);
      expect(body.data?.pagination.pages).toBe(3);
    });

    it('should not allow regular user to access history', async () => {
      const res = await request(app)
        .get('/api/admin/newsletter/history')
        .set('Authorization', `Bearer ${userToken}`);

      const body = res.body as ApiResponse<null>;

      expect(res.status).toBe(403);
      expect(body.success).toBe(false);
    });
  });
}); 