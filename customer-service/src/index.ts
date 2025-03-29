import dotenv from 'dotenv';
import express, { Application } from 'express';
import { connectDB } from './config/db';
import customerRoutes from './routes/customer.routes';
import chalk from 'chalk';
import { seedDatabase } from './seed';
dotenv.config();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

export const app: Application = express();
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Routes
app.use('/api/customer', customerRoutes);

app.listen(PORT, () => {
  console.log(`Customer Service running on port ${PORT}`);
  seedDatabase();
});

function overrideConsole() {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  const color = chalk.green('[Customer-Service]:');

  console.log = (...args) => originalLog(color, ...args);
  console.info = (...args) => originalInfo(color, ...args);
  console.warn = (...args) => originalWarn(color, ...args);
  console.error = (...args) => originalError(color, ...args);
}

overrideConsole();
