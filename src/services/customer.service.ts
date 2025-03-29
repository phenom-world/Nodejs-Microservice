import mongoose from 'mongoose';
import { ICustomerDocument } from '../models/customer.model';
import axios from 'axios';
import { BadRequestError, NotFoundError } from '../shared/util/error.util';
import { FundResponse } from '../types';

const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:3001';

class CustomerService {
  private readonly customerModel: mongoose.Model<ICustomerDocument>;

  constructor(customerModel: mongoose.Model<ICustomerDocument>) {
    this.customerModel = customerModel;
  }

  async createCustomer(name: string): Promise<ICustomerDocument> {
    const customer = await this.customerModel.create({ name });
    return customer;
  }

  async fundAccount(id: string, amount: number): Promise<FundResponse> {
    const customer = await this.customerModel.findById(id);
    if (!customer) {
      throw new NotFoundError('this customer does not exist');
    }

    if (!amount || amount <= 0) {
      throw new BadRequestError('Invalid amount');
    }

    try {
      // Forward the request to Billing Service
      const response = await axios.post(`${BILLING_SERVICE_URL}/api/transactions`, {
        customerId: customer._id,
        amount,
        status: 'pending',
        type: 'fund',
      });

      return {
        message: 'Fund request processed successfully',
        transactionId: response.data.transactionId,
      };
    } catch (error) {
      console.error('Error processing fund request:', error);
      throw error;
    }
  }

  async updateCustomerBalance(customerId: string, amount: number): Promise<void> {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new NotFoundError('this customer does not exist');
    }

    customer.balance += amount;
    await customer.save();
  }
}

export default CustomerService;
