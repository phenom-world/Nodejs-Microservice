import { AppConstants } from './types';

const APP_CONSTANTS: AppConstants = {
  rabbitMQ: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    exchanges: {
      billing: 'billing_exchange',
    },
    queues: {
      billing: 'billing_worker_queue',
    },
    routingKeys: {
      transactionCreated: 'transaction.created',
      transactionSuccess: 'transaction.success',
    },
  },
  billingService: {
    url: process.env.BILLING_SERVICE_URL || 'http://localhost:3001',
  },
  customerService: {
    url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3000',
  },
};

export default APP_CONSTANTS;
