import joi from 'joi';

export const validate = <T>(
  payload: { [key: string]: any } | unknown,
  schema: joi.AlternativesSchema | joi.ArraySchema | joi.ObjectSchema
): T => {
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    const errorDetails = error.details;
    const formattedErrorDetails = errorDetails.map((errorDetail) => ({
      details: errorDetail.message.replace(/(["'])(?:(?=(\\?))\2.)*?\1/, 'This field'),
      path: errorDetail.path.join('.'),
    }));

    throw new Error('Invalid request data: ' + JSON.stringify(formattedErrorDetails));
  }

  return value;
};
