export type AppConstants = {
  rabbitMQ: {
    url: string;
    exchanges: {
      billing: string;
    };
    queues: {
      billing: string;
    };
    routingKeys: {
      transactionCreated: string;
      transactionSuccess: string;
    };
  };
  billingService: {
    url: string;
  };
  customerService: {
    url: string;
  };
};
