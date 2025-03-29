import Customer from './models/customer.model';

export const seedDatabase = async () => {
  try {
    const customerExists = await Customer.findOne({ name: 'John Doe' });
    if (customerExists) {
      console.log('Customer already exists', customerExists);
      return;
    }
    const customer = await Customer.create({
      name: 'John Doe',
      balance: 1000,
    });
    console.log('Database seeded successfully with customer', customer);
  } catch (error) {
    console.error('Error seeding database', error);
  }
};
