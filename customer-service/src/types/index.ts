export type ICustomer = {
  name: string;
  balance: number;
};

export type FundAccountRequest = {
  amount: number;
};

export type FundResponse = {
  message: string;
  transactionId: string;
};
