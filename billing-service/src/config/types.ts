export type AppConstants = {
  rabbitMQ: {
    url: string;
    exchanges: {
      billing: string;
    };
    routingKeys: {
      transactionCreated: string;
      transactionSuccess: string;
    };
  };
};
