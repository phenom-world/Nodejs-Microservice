import RabbitMQConsumerService from '../services/rabbitmq.service';
import axios from 'axios';
import APP_CONSTANTS from '../../config/constants';
import { validatePayload } from '../helper/validate-payload';
import chalk from 'chalk';

const options = {
  queue: APP_CONSTANTS.rabbitMQ.queues.billing,
  exchange: APP_CONSTANTS.rabbitMQ.exchanges.billing,
  routingKey: APP_CONSTANTS.rabbitMQ.routingKeys.transactionSuccess,
};

const transactionSuccessConsumer = new RabbitMQConsumerService(
  APP_CONSTANTS.rabbitMQ.url,
  options,
  async (msg) => {
    const channel = await transactionSuccessConsumer.getChannel();
    const content = msg.content.toString();
    console.info(`[Transaction Success Consumer] => { content => ${content} }`);
    try {
      const validData = validatePayload(JSON.parse(content));

      await axios.put(
        `${APP_CONSTANTS.customerService.url}/api/customer/${validData.customerId}/balance`,
        { amount: validData.amount }
      );

      channel?.ack(msg);

      console.info(chalk.green(`[Transaction Success Consumer]: Success`));
    } catch (error: any) {
      const errorMessage = ` [Transaction Success Consumer]: Failed => ${
        error.response?.data?.message ?? error?.message
      }`;
      console.error(chalk.red(errorMessage));

      channel?.nack(msg, undefined, false);
    }
  }
);

export default transactionSuccessConsumer;
