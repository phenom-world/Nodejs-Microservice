import { Request, Response } from 'express';
import TransactionService from '../services/transaction.service';
import { ITransactionResponse, ITransactionUpdateResponse } from '../types';
import Transaction from '../models/transaction.model';
import { TransactionCreatedPublisher } from '../shared/publishers/transaction-created.publisher';
import { TransactionSuccessPublisher } from '../shared/publishers/transaction-success.publisher';

class TransactionController {
  private transactionService: TransactionService;
  private transactionCreatedPublisher: TransactionCreatedPublisher;
  private transactionSuccessPublisher: TransactionSuccessPublisher;

  constructor() {
    this.transactionCreatedPublisher = new TransactionCreatedPublisher();
    this.transactionSuccessPublisher = new TransactionSuccessPublisher();
    this.transactionService = new TransactionService(
      Transaction,
      this.transactionCreatedPublisher,
      this.transactionSuccessPublisher
    );
  }

  getTransactions = async (req: Request, res: Response): Promise<void> => {
    const transactions = await this.transactionService.getTransactions();
    res.json({ data: transactions });
  };

  // Creates a new transaction and returns the transaction ID
  createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const transaction = await this.transactionService.createTransaction(req.body);
      const response: ITransactionResponse = {
        transactionId: transaction.id,
        message: 'Transaction created successfully',
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to create transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Updates transaction status by ID and returns the updated transaction
  updateTransactionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const transaction = await this.transactionService.updateTransactionStatus(id, status);

      const response: ITransactionUpdateResponse = {
        message: 'Transaction status updated successfully',
        transaction,
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to update transaction status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

export default new TransactionController();
