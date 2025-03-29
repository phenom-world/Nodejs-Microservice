import joi from 'joi';
import { validate } from '.';

export const validatePayload = (
  content: unknown
): {
  id: string;
  amount: number;
  status: string;
  type: string;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
} => {
  const { object, string, number } = joi.types();
  const schema = object.keys({
    id: string,
    amount: number,
    status: string,
    type: string,
    customerId: string,
    createdAt: Date,
    updatedAt: Date,
  });
  return validate(content, schema);
};
