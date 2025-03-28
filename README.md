# Nodejs Microservices

This project demonstrates a microservices architecture with three services:

1. Customer Service
2. Billing Service
3. Billing Worker Service

# Problem Statement

When a customer funds their account:

1. A request containing customer data (customerId, amount, etc.) is sent to the Billing Service via REST API
2. The Billing Service:

   - Saves the transaction details (amount, customerId, status="pending", etc.)
   - Publishes the transaction to the Billing Worker Service
   - These operations are performed atomically

3. The Billing Worker Service:
   - Processes the transaction through a dummy charge method (simulated with 100ms delay)
   - Updates the transaction status to "success" in the Billing Service database using the transactionId

## Prerequisites

- Node.js (v14 or higher)
- RabbitMQ (running locally or accessible via URL)
- MongoDB (running locally or accessible via URL)

## Setup

1. Install dependencies for each service:

```bash
cd customer-service && npm install
cd ../billing-service && npm install
cd ../billing-worker-service && npm install
```

2. Create `.env` files in each service directory (optional, defaults are provided):

```env
# customer-service/.env
PORT=3000
BILLING_SERVICE_URL=http://localhost:3001
MONGODB_URI=mongodb://localhost:27017/customer-service

# billing-service/.env
PORT=3001
RABBITMQ_URL=amqp://localhost
MONGODB_URI=mongodb://localhost:27017/billing-service

# billing-worker-service/.env
RABBITMQ_URL=amqp://localhost
BILLING_SERVICE_URL=http://localhost:3001
```

## Running the Services

1. Start the Customer Service:

```bash
cd customer-service && npm start
```

2. Start the Billing Service:

```bash
cd billing-service && npm start
```

3. Start the Billing Worker Service:

```bash
cd billing-worker-service && npm start
```

## Testing the Flow

1. Create a new customer:

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "initialBalance": 1000}'
```

2. Fund a customer's account:

```bash
curl -X POST http://localhost:3000/api/customers/{customerId}/fund \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'
```

## Architecture

- Customer Service (Port 3000): Handles customer-related operations and initiates funding requests
- Billing Service (Port 3001): Manages transactions and publishes them to RabbitMQ
- Billing Worker Service: Processes transactions from RabbitMQ and updates their status

The flow is:

1. Customer initiates funding request
2. Billing Service creates transaction and publishes to RabbitMQ
3. Billing Worker processes the transaction and updates its status

## Database Schema

### Customer Collection

```javascript
{
  customerId: String,
  name: String,
  balance: Number,
  createdAt: Date
}
```

### Transaction Collection

```javascript
{
  transactionId: String,
  customerId: String,
  amount: Number,
  status: String,
  timestamp: Date
}
```
