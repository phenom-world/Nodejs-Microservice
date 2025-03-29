import { Router } from 'express';
import transactionController from '../controllers/transaction.controller';

const router: Router = Router();

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.put('/:id', transactionController.updateTransactionStatus);

export default router;
