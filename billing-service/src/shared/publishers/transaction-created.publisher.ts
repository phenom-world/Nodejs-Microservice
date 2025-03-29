import { ITransactionDocument } from '../../models/transaction.model';
import config from '../../config/constants';
import rabbitmqService from '../services/rabbitmq.service';

export class TransactionCreatedPublisher {
  async publish(transaction: Omit<ITransactionDocument, 'messagePublished'>): Promise<void> {
    await rabbitmqService.publishMessage(
      config.rabbitMQ.exchanges.billing,
      config.rabbitMQ.routingKeys.transactionCreated,
      transaction
    );
  }
}
