import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: required('JWT_SECRET', 'ataraxia-dev-secret-change-in-production'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  mongoUri: required('MONGO_URI', 'mongodb://localhost:27017'),
  mongoDbName: process.env.MONGO_DB_NAME ?? 'ataraxia',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
} as const;
