import mongoose, { Document } from 'mongoose';
import { ITransaction, TransactionStatus, TransactionType } from '../types/index';

export interface ITransactionDocument extends Omit<ITransaction, 'id'>, Document {}

const transactionSchema = new mongoose.Schema<ITransactionDocument>(
  {
    customerId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(TransactionType),
    },
    messagePublished: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

transactionSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.model<ITransactionDocument>('Transaction', transactionSchema);
