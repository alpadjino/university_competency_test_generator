import express from "express";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import dotenv from "dotenv";

import { connectDB } from "./config/db";
import { runMigrations } from "./config/migrate";
import { RegisterRoutes } from "./routes";
import swaggerDocument from '../build/swagger.json';

import './models/index';

async function startServer() {
  dotenv.config();

  const app = express();

  app.use(cors());
  app.use(express.json());

  runMigrations();
  await connectDB();

  RegisterRoutes(app);

  app.use("/api-docs", swaggerUi.serve, async (_req: any, res: any) => {
    return res.send(swaggerUi.generateHTML(swaggerDocument));
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Сервер: http://localhost:${PORT}`);
    console.log(`📄 Документация: http://localhost:${PORT}/api-docs`);
  });
};

startServer();
