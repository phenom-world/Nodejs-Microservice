import mongoose, { Model } from 'mongoose';
import CustomerService from './customer.service';
import { ICustomerDocument } from '../models/customer.model';
import axios from 'axios';
import { BadRequestError, NotFoundError } from '../shared/util/error.util';

jest.spyOn(axios, 'post');

describe('CustomerService', () => {
  let customerService: CustomerService;
  let mockCustomerModel: jest.Mocked<Model<ICustomerDocument>>;
  let mockCustomer: ICustomerDocument & { save: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCustomer = {
      name: 'John Doe',
      balance: 0,
      _id: '12345',
      save: jest.fn().mockResolvedValue(true),
    } as any;

    mockCustomerModel = {
      create: jest.fn().mockResolvedValue(mockCustomer),
      findById: jest.fn().mockResolvedValue(mockCustomer),
    } as any;

    customerService = new CustomerService(mockCustomerModel);

    (axios.post as jest.Mock).mockResolvedValue({
      data: { transactionId: 'transaction123' },
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer successfully', async () => {
      const result = await customerService.createCustomer('John Doe');
      expect(result.name).toEqual('John Doe');
      expect(result.balance).toEqual(0);
    });
  });

  describe('fundAccount', () => {
    it('should fund account successfully', async () => {
      const result = await customerService.fundAccount('12345', 100);
      expect(result.message).toEqual('Fund request processed successfully');
      expect(result.transactionId).toBeDefined();
    });

    it('should throw error for invalid requests', async () => {
      mockCustomerModel.findById.mockResolvedValueOnce(null);
      await expect(customerService.fundAccount('12345', 100)).rejects.toThrow(NotFoundError);
      await expect(customerService.fundAccount('12345', 0)).rejects.toThrow(BadRequestError);
      await expect(customerService.fundAccount('12345', -100)).rejects.toThrow(BadRequestError);
    });
  });

  describe('updateCustomerBalance', () => {
    it('should update customer balance successfully', async () => {
      await customerService.updateCustomerBalance('12345', 100);
      expect(mockCustomer.balance).toEqual(100);
      expect(mockCustomer.save).toHaveBeenCalled();
    });

    it('should throw error for invalid requests', async () => {
      mockCustomerModel.findById.mockResolvedValueOnce(null);
      await expect(customerService.updateCustomerBalance('12345', 100)).rejects.toThrow(
        NotFoundError
      );

      const error = new Error('Database error');
      mockCustomer.save.mockRejectedValueOnce(error);
      await expect(customerService.updateCustomerBalance('12345', 100)).rejects.toThrow(error);
    });
  });
});
