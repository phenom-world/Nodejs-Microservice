import config from '../../config/constants';
import rabbitmqService from '../services/rabbitmq.service';

export class TransactionSuccessPublisher {
  async publish(transaction: { customerId: string; amount: number }): Promise<void> {
    await rabbitmqService.publishMessage(
      config.rabbitMQ.exchanges.billing,
      config.rabbitMQ.routingKeys.transactionSuccess,
      transaction
    );
  }
}
