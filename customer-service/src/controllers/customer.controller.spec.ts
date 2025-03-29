import request from 'supertest';
import { app } from '../index';
import customerModel, { ICustomerDocument } from '../models/customer.model';
import { setupTestDB } from '../test/setup';

describe('Customer Controller', () => {
  setupTestDB();

  describe('create customer', () => {
    it('should return 201 and the customer created', async () => {
      const response = await request(app)
        .post('/api/customer')
        .set('content-type', 'application/json')
        .send({
          name: 'test user',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toEqual('test user');
      expect(response.body.balance).toEqual(0);
    });
  });

  describe('fund customer account', () => {
    let customer: ICustomerDocument;
    beforeEach(async () => {
      customer = await customerModel.create({
        name: 'test user',
      });
    });

    it('should return 200 and fund the customer account', async () => {
      const response = await request(app)
        .post(`/api/customer/${customer._id}/fund`)
        .send({ amount: 100 })
        .set('Accept', 'application/json');

      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual('Fund request processed successfully');
      expect(response.body.transactionId).toBeDefined();
    });

    it('should return 404 if the customer with the id doesnt exist', async () => {
      const customerId = '639c80ef98284bfdf111ad09';
      const response = await request(app)
        .post(`/api/customer/${customerId}/fund`)
        .send({ amount: 100 })
        .set('Accept', 'application/json');
      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('this customer does not exist');
    });
  });

  describe('update customer balance', () => {
    it('should update the customer balance', async () => {
      const customer = await customerModel.create({
        name: 'test user',
      });

      const response = await request(app)
        .put(`/api/customer/${customer._id}/balance`)
        .send({ amount: 100 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Customer balance updated successfully');
    });
  });
});
