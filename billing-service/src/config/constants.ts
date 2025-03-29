import { AppConstants } from './types';

const APP_CONSTANTS: AppConstants = {
  rabbitMQ: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    exchanges: {
      billing: 'billing_exchange',
    },
    routingKeys: {
      transactionCreated: 'transaction.created',
      transactionSuccess: 'transaction.success',
    },
  },
};

export default APP_CONSTANTS;
