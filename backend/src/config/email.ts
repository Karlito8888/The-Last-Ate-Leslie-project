interface EmailConfig {
  host: string | undefined;
  port: number;
  auth: {
    user: string | undefined;
    pass: string | undefined;
  };
  from: string;
  commercialEmail: string;
}

export const EMAIL_CONFIG: EmailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  from: process.env.EMAIL_FROM || 'noreply@ateleslie.com',
  commercialEmail: process.env.COMMERCIAL_EMAIL || 'commercial@ateleslie.com'
}; 