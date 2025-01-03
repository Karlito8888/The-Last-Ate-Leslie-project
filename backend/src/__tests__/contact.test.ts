import request from 'supertest';
import { app } from '../index';
import { ApiResponse } from '../types/api';

// Mock nodemailer
jest.mock('nodemailer', () => require('./mocks/nodemailer').default);

describe('Contact Endpoints', () => {
  const validContactData = {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Test message',
    subject: 'Test subject'
  };

  describe('POST /api/contact', () => {
    it('should send contact message successfully', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send(validContactData);

      const body = res.body as ApiResponse<null>;

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Message envoyé avec succès');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({});

      const body = res.body as ApiResponse<null>;

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Nom, email et message sont requis');
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({
          ...validContactData,
          email: 'invalid-email'
        });

      const body = res.body as ApiResponse<null>;

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Format d\'email invalide');
    });

    it('should handle missing subject', async () => {
      const { subject, ...dataWithoutSubject } = validContactData;
      
      const res = await request(app)
        .post('/api/contact')
        .send(dataWithoutSubject);

      const body = res.body as ApiResponse<null>;

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    });
  });
}); 