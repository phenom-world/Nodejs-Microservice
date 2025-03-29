import mongoose, { Model } from 'mongoose';
import { ITransactionDocument } from '../models/transaction.model';
import { ITransaction, ITransactionData } from '../types/index';
import { TransactionCreatedPublisher } from '../shared/publishers/transaction-created.publisher';
import { TransactionSuccessPublisher } from '../shared/publishers/transaction-success.publisher';

class TransactionService {
  private transactionModel: Model<ITransactionDocument>;
  private transactionCreatedPublisher: TransactionCreatedPublisher;
  private transactionSuccessPublisher: TransactionSuccessPublisher;

  constructor(
    model: Model<ITransactionDocument>,
    publisher: TransactionCreatedPublisher,
    transactionSuccessPublisher: TransactionSuccessPublisher
  ) {
    this.transactionModel = model;
    this.transactionCreatedPublisher = publisher;
    this.transactionSuccessPublisher = transactionSuccessPublisher;
  }

  async getTransactions(): Promise<ITransactionDocument[]> {
    return this.transactionModel.find();
  }

  async createTransaction(transactionData: ITransactionData): Promise<ITransactionDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { customerId, amount, status, type } = transactionData;

      // Create transaction record
      const transactions = await this.transactionModel.create(
        [{ customerId, amount, status, type }],
        {
          session,
        }
      );
      const transaction = transactions[0];

      // publish message to rabbitmq
      try {
        const { messagePublished, ...transactionData } = transaction.toJSON();
        await this.transactionCreatedPublisher.publish(transactionData);
        transaction.messagePublished = true;
        await transaction.save({ session });
      } catch (publishError) {
        throw new Error(
          `Failed to publish message: ${
            publishError instanceof Error ? publishError.message : 'Unknown error'
          }`
        );
      }

      await session.commitTransaction();
      return transaction.toJSON();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateTransactionStatus(
    id: string,
    status: 'pending' | 'success' | 'failed'
  ): Promise<ITransaction> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await this.transactionModel.findById(id);
      // update transaction status
      const transaction = await this.transactionModel.findByIdAndUpdate(
        { _id: id },
        { status },
        { new: true, session }
      );

      if (!transaction) {
        throw new Error('Transaction not found');
      }
      const response = transaction.toJSON();

      if (status === 'success') {
        // publish message to rabbitmq
        try {
          await this.transactionSuccessPublisher.publish({
            customerId: response.customerId,
            amount: response.amount,
          });
          transaction.messagePublished = true;
          await transaction.save({ session });
        } catch (publishError) {
          throw new Error(
            `Failed to publish message: ${
              publishError instanceof Error ? publishError.message : 'Unknown error'
            }`
          );
        }
      }

      await session.commitTransaction();

      return {
        id: response.id,
        status: response.status,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        messagePublished: response.messagePublished,
        customerId: response.customerId,
        amount: response.amount,
        type: response.type,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default TransactionService;
