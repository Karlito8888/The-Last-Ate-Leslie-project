declare module 'crypto' {
  export * from 'node:crypto';
}

declare module 'path' {
  export * from 'node:path';
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    EMAIL_FROM: string;
    COMMERCIAL_EMAIL: string;
    CLIENT_URL: string;
  }
} 