import amqp from 'amqplib';
import config from '../../config/constants';

type Options = {
  queue: string;
  exchange?: string;
  routingKey?: string;
  type?: string;
};

let channel: amqp.Channel;
let connection: amqp.ChannelModel;

class RabbitMQConsumerService {
  private url: string;
  private readonly options: Options;
  private onMessage: (msg: amqp.Message) => Promise<void>;

  constructor(url: string, options: Options, onMessage: (msg: amqp.Message) => Promise<void>) {
    this.url = url;
    this.options = options;
    this.onMessage = onMessage;
  }

  async connectAmqp() {
    try {
      connection = await amqp.connect(this.url);
      channel = await connection.createChannel();
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
    }
  }

  async getChannel(): Promise<amqp.Channel | null> {
    if (!channel) {
      await this.connectAmqp();
    }
    return channel;
  }

  async startExchange(): Promise<amqp.Replies.Consume | undefined> {
    try {
      if (!channel) {
        await this.connectAmqp();
      }

      await channel.assertExchange(this.options.exchange || '', this.options.type || 'direct', {
        durable: true,
      });
      await channel.assertQueue(this.options.queue, { durable: true });
      await channel.bindQueue(
        this.options.queue,
        this.options.exchange || '',
        this.options.routingKey || ''
      );

      console.log('Worker connected to RabbitMQ');

      const consumer = channel.consume(config.rabbitMQ.queues.billing, async (msg) => {
        if (msg !== null) {
          this.onMessage(msg);
        }
      });

      return consumer;
    } catch (error) {
      console.error('Error starting worker:', error);
    }
  }

  async closeAmqpConnection(): Promise<void> {
    if (!channel || !connection) {
      throw new Error('No connection');
    }
    try {
      await channel.close();
      await connection.close();
      console.log('AMQP connection closed');
    } catch (error) {
      console.error('Error closing amqp connection', error);
    }
  }
}

export default RabbitMQConsumerService;
