import { Request, Response } from 'express';
import CustomerService from '../services/customer.service';
import Customer from '../models/customer.model';
import { StatusCodes } from 'http-status-codes';

class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService(Customer);
  }

  createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      const result = await this.customerService.createCustomer(name);
      res.status(201).json(result.toJSON());
    } catch (error) {
      res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Unexpected error occured',
      });
    }
  };

  fundAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount } = req.body;
      const { id } = req.params;
      const result = await this.customerService.fundAccount(id, amount);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Unexpected error occured',
      });
    }
  };

  updateCustomerBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount } = req.body;
      const { id } = req.params;
      await this.customerService.updateCustomerBalance(id, amount);
      res.status(200).json({
        message: 'Customer balance updated successfully',
      });
    } catch (error) {
      res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Unexpected error occured',
      });
    }
  };
}

export default new CustomerController();
