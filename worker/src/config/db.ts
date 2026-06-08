import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

export const db = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async (retries = 10, delayMs = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await db.authenticate();
      console.log('🚀 Worker подключён к базе данных');
      return;
    } catch (error) {
      if (attempt === retries) {
        console.error('❌ Ошибка подключения worker к базе данных:', error);
        process.exit(1);
      }
      console.warn(`БД недоступна, повтор ${attempt}/${retries} через ${delayMs} мс…`);
      await sleep(delayMs);
    }
  }
};
