import RabbitMQConsumerService from '../services/rabbitmq.service';
import axios from 'axios';
import APP_CONSTANTS from '../../config/constants';
import { ITransaction, TransactionStatus, TransactionType } from '../../types';
import { validatePayload } from '../helper/validate-payload';
import chalk from 'chalk';

const options = {
  queue: APP_CONSTANTS.rabbitMQ.queues.billing,
  exchange: APP_CONSTANTS.rabbitMQ.exchanges.billing,
  routingKey: APP_CONSTANTS.rabbitMQ.routingKeys.transactionCreated,
};

async function charge(): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 100);
  });
}

async function processTransaction(transaction: ITransaction): Promise<void> {
  try {
    console.log(`Processing transaction: ${transaction.id}`);
    await charge();

    await axios.put(`${APP_CONSTANTS.billingService.url}/api/transactions/${transaction.id}`, {
      status: 'success',
    });

    console.log(`Transaction ${transaction.id} processed successfully`);
  } catch (error) {
    console.error(`Error processing transaction ${transaction.id}:`, error.response.data);
  }
}

const transactionCreatedConsumer = new RabbitMQConsumerService(
  APP_CONSTANTS.rabbitMQ.url,
  options,
  async (msg) => {
    const channel = await transactionCreatedConsumer.getChannel();
    const content = msg.content.toString();
    try {
      const validData = validatePayload(JSON.parse(content));

      await processTransaction({
        ...validData,
        status: validData.status as TransactionStatus,
        type: validData.type as TransactionType,
      });

      channel?.ack(msg);

      console.info(chalk.green(`[Transaction Created Consumer]: Success`));
    } catch (error: any) {
      const errorMessage = `[Transaction Created Consumer]: Failed => ${
        error.response?.data?.message ?? error?.message
      }`;
      console.error(chalk.red(errorMessage));
      channel?.nack(msg, undefined, false);
    }
  }
);

export default transactionCreatedConsumer;
