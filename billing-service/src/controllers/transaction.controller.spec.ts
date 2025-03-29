import transactionController from './transaction.controller';
import TransactionService from '../services/transaction.service';
import { Request, Response } from 'express';
import { TransactionStatus, TransactionType } from '../types';

describe('TransactionController', () => {
  let mockTransactionService: jest.Mocked<TransactionService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockTransaction: any;

  beforeEach(() => {
    mockTransactionService = {
      createTransaction: jest.fn(),
      updateTransactionStatus: jest.fn(),
    } as any;

    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    mockTransaction = {
      id: '123',
      customerId: '456',
      amount: 100,
      type: TransactionType.FUND,
      createdAt: new Date(),
      updatedAt: new Date(),
      messagePublished: true,
    };

    // @ts-ignore
    transactionController.transactionService = mockTransactionService;
  });

  describe('createTransaction', () => {
    beforeEach(() => {
      mockTransaction.status = TransactionStatus.PENDING;
      mockRequest.body = {
        customerId: '456',
        amount: 100,
        status: TransactionStatus.PENDING,
        type: TransactionType.FUND,
      };
    });

    it('should create transaction successfully', async () => {
      mockTransactionService.createTransaction.mockResolvedValue(mockTransaction);

      await transactionController.createTransaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.json).toHaveBeenCalledWith({
        transactionId: mockTransaction.id,
        message: 'Transaction created successfully',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      mockTransactionService.createTransaction.mockRejectedValue(error);

      await transactionController.createTransaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Failed to create transaction',
        error: 'Test error',
      });
    });
  });

  describe('updateTransactionStatus', () => {
    beforeEach(() => {
      mockTransaction.status = TransactionStatus.SUCCESS;
      mockRequest.params = { id: '123' };
      mockRequest.body = { status: TransactionStatus.SUCCESS };
    });

    it('should update transaction status successfully', async () => {
      mockTransactionService.updateTransactionStatus.mockResolvedValue(mockTransaction);

      await transactionController.updateTransactionStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockTransactionService.updateTransactionStatus).toHaveBeenCalledWith(
        mockRequest.params?.id,
        mockRequest.body.status
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Transaction status updated successfully',
        transaction: mockTransaction,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      mockTransactionService.updateTransactionStatus.mockRejectedValue(error);

      await transactionController.updateTransactionStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Failed to update transaction status',
        error: 'Test error',
      });
    });
  });
});
