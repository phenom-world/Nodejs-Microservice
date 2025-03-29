import 'dotenv/config';
import transactionCreatedConsumer from './shared/subscribers/transaction-created.subscriber';
import transactionSuccessConsumer from './shared/subscribers/transaction-success.subscriber';
import chalk from 'chalk';

class BillingWorker {
  async start() {
    await transactionCreatedConsumer.startExchange();
    await transactionSuccessConsumer.startExchange();
  }
}

// Start the worker
new BillingWorker().start();

function overrideConsole() {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  const color = chalk.yellow('[Billing-Worker-Service]:');

  console.log = (...args) => originalLog(color, ...args);
  console.info = (...args) => originalInfo(color, ...args);
  console.warn = (...args) => originalWarn(color, ...args);
  console.error = (...args) => originalError(color, ...args);
}

overrideConsole();
