import mongoose, { Document } from 'mongoose';
import { ICustomer } from '../types/index';

export interface ICustomerDocument extends Omit<ICustomer, '_id'>, Document {}

const customerSchema = new mongoose.Schema<ICustomerDocument>(
  {
    name: { type: String, required: true },
    balance: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

customerSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});
export default mongoose.model<ICustomerDocument>('Customer', customerSchema);
