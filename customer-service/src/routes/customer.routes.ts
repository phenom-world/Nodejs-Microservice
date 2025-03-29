import { Router } from 'express';
import customerController from '../controllers/customer.controller';

const router: Router = Router();

router.post('/', customerController.createCustomer);
router.post('/:id/fund', customerController.fundAccount);
router.put('/:id/balance', customerController.updateCustomerBalance);

export default router;
