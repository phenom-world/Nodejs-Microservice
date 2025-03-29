export interface ITransaction extends ITransactionData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionData {
  customerId: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum TransactionType {
  FUND = 'fund',
  WITHDRAWAL = 'withdrawal',
}
