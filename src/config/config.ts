import dotenv from 'dotenv';
dotenv.config();

export default {
  APP: process.env.APP || 'development',
  PORT: process.env.PORT || '3000',
  EXTERNAL_URL: process.env.EXTERNAL_URL || 'http://localhost:3000',

  DB_DIALECT: process.env.DB_DIALECT || 'mongo',
  DB_HOST: process.env.DB_HOST || 'mongodb://server:port/database',
  DB_NAME: process.env.DB_NAME || 'database',
  DB_PORT: process.env.DB_PORT || 'port',
  DB_USER: process.env.DB_USER || 'username',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',

  JWT_ENCRYPTION: process.env.JWT_ENCRYPTION || 'HS256',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  SALT_ROUNDS: !isNaN(+process.env.SALT_ROUNDS) ? +process.env.SALT_ROUNDS : 10,
};
