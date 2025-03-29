import dotenv from 'dotenv';
import express, { Application } from 'express';
import { connectDB } from './config/db';
import transactionRoutes from './routes/transaction.routes';
import rabbitmqService from './shared/services/rabbitmq.service';
import chalk from 'chalk';

dotenv.config();

export const app: Application = express();
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || '3001', 10);

// Connect to MongoDB
connectDB();

// Initialize RabbitMQ connection
rabbitmqService.connectAmqp();

// Routes
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => {
  console.log(`Billing Service running on port ${PORT}`);
});

function overrideConsole() {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  const color = chalk.cyan('[Billing-Service]:');

  console.log = (...args) => originalLog(color, ...args);
  console.info = (...args) => originalInfo(color, ...args);
  console.warn = (...args) => originalWarn(color, ...args);
  console.error = (...args) => originalError(color, ...args);
}

overrideConsole();
