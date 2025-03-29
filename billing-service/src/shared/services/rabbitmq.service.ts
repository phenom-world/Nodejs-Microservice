import amqp from 'amqplib';
import config from '../../config/constants';

let channel: amqp.Channel;
let connection: amqp.ChannelModel;

class RabbitMQService {
  async connectAmqp() {
    const hostname = new URL(config.rabbitMQ.url).hostname;
    try {
      connection = await amqp.connect(config.rabbitMQ.url, { servername: hostname });
      channel = await connection.createChannel();
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
    }
  }

  async publishMessage(exchange: string, routingKey: string, message: object | string) {
    if (!channel) {
      await this.connectAmqp();
    }
    await channel.assertExchange(exchange, 'direct', { durable: true });
    const messageString = this.stringifyMessage(message);

    channel.publish(exchange, routingKey, Buffer.from(messageString), {
      persistent: true,
    });
    console.log(`[x] sent ${messageString} to exchange ${exchange}`);
  }

  closeAmqpConnection = async (): Promise<void> => {
    try {
      await channel.close();
      await connection.close();
      console.log('AMQP connection closed');
    } catch (error) {
      console.error('Error closing amqp connection', error);
    }
  };

  stringifyMessage(message: object | string) {
    return typeof message === 'object' ? JSON.stringify(message) : message;
  }
}

export default new RabbitMQService();
