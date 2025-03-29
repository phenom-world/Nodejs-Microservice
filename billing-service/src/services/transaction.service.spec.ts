import mongoose, { ClientSession, Model } from 'mongoose';
import TransactionService from './transaction.service';
import { ITransactionDocument } from '../models/transaction.model';
import { ITransactionData, TransactionStatus, TransactionType } from '../types';
import { TransactionCreatedPublisher } from '../shared/publishers/transaction-created.publisher';
import { TransactionSuccessPublisher } from '../shared/publishers/transaction-success.publisher';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let mockTransactionModel: jest.Mocked<Model<ITransactionDocument>>;
  let mockTransactionCreatedPublisher: jest.Mocked<TransactionCreatedPublisher>;
  let mockTransactionSuccessPublisher: jest.Mocked<TransactionSuccessPublisher>;
  let mockTransaction: ITransactionDocument & { save: jest.Mock };
  let mockSession: ClientSession;

  const mockTransactionData: ITransactionData = {
    customerId: '1233',
    amount: 10.99,
    status: TransactionStatus.PENDING,
    type: TransactionType.FUND,
  };

  const mockTransactionResponse = {
    ...mockTransactionData,
    id: '12345',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const setUpMocks = () => {
    // Setup mock session
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    } as any;

    // Setup mock transaction
    mockTransaction = {
      ...mockTransactionData,
      _id: '12345',
      messagePublished: false,
      save: jest.fn().mockResolvedValue({ session: mockSession }),
      toJSON: jest.fn().mockImplementation(() => ({
        ...mockTransactionResponse,
        status: mockTransaction.status,
      })),
    } as any;

    // Setup mock publishers
    mockTransactionCreatedPublisher = { publish: jest.fn() };
    mockTransactionSuccessPublisher = { publish: jest.fn() };

    // Setup mock transaction model
    mockTransactionModel = {
      create: jest.fn().mockResolvedValue([mockTransaction]),
      findByIdAndUpdate: jest.fn().mockImplementation((id, update) => {
        mockTransaction.status = update.status;
        return mockTransaction;
      }),
      findById: jest.fn().mockResolvedValue(mockTransaction),
    } as any;

    // Mock mongoose session
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setUpMocks();

    // Initialize service
    transactionService = new TransactionService(
      mockTransactionModel,
      mockTransactionCreatedPublisher,
      mockTransactionSuccessPublisher
    );
  });

  describe('createTransaction', () => {
    it('should create a new transaction successfully', async () => {
      const result = await transactionService.createTransaction(mockTransactionData);

      expect(result.customerId).toEqual(mockTransactionData.customerId);
      expect(result.amount).toEqual(mockTransactionData.amount);
      expect(result.status).toEqual(mockTransactionData.status);
      expect(result.type).toEqual(mockTransactionData.type);

      expect(mockTransactionCreatedPublisher.publish).toHaveBeenCalledWith(mockTransactionResponse);
      expect(mockTransaction.save).toHaveBeenCalledWith({ session: mockSession });
      expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction if publishing fails', async () => {
      const errorMessage = 'Publish failed';
      mockTransactionCreatedPublisher.publish.mockRejectedValue(new Error(errorMessage));

      await expect(transactionService.createTransaction(mockTransactionData)).rejects.toThrow(
        `Failed to publish message: ${errorMessage}`
      );

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update transaction status successfully', async () => {
      const result = await transactionService.updateTransactionStatus(
        mockTransaction._id as string,
        TransactionStatus.SUCCESS
      );

      expect(result.status).toEqual(TransactionStatus.SUCCESS);
      expect(mockTransactionSuccessPublisher.publish).toHaveBeenCalledWith({
        customerId: mockTransaction.customerId,
        amount: mockTransaction.amount,
      });
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback transaction if publishing fails', async () => {
      const errorMessage = 'Publish failed';
      mockTransactionSuccessPublisher.publish.mockRejectedValue(new Error(errorMessage));

      await expect(
        transactionService.updateTransactionStatus(
          mockTransaction._id as string,
          TransactionStatus.SUCCESS
        )
      ).rejects.toThrow(`Failed to publish message: ${errorMessage}`);

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });
});
