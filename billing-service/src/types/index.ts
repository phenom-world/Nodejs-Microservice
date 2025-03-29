export interface ITransaction extends ITransactionData {
  id: string;
  messagePublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITransactionData {
  customerId: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
}

export interface ITransactionResponse {
  transactionId: string;
  message: string;
}

export interface ITransactionUpdateResponse {
  message: string;
  transaction: ITransaction;
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
