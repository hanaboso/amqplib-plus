import { Channel, ConsumeMessage, Message, Options, Replies } from "amqplib";

import { Client } from "./Client";

/**
 * Consumer class to be overridden by your custom implementation with custom processMessage function
 */
export abstract class Consumer extends Client {
  /**
   * Start consuming messages from queue
   * Resolves promise when the consumption is ready and returns consumerTag string
   *
   * @return {Promise}
   */
  public async consume(
    queue: string,
    options: Options.Consume
  ): Promise<string> {
    const fallback = () => this.consume(queue, options);
    const channel = await this.channel;

    if(!channel) {
      throw new Error('Channel was not established.');
    }

    const processFn = (msg: ConsumeMessage | null) => {
      if (msg){
        this.processMessage(msg, channel);
      }
    };

    channel.on("close", () => {
      // Wait a while until new connection is established and the start consumption again
      setTimeout(fallback, 200);
    });

    const consumeReply: Replies.Consume = await channel.consume(
      queue,
      processFn,
      options
    );

    this.logger.info(
      `Started consuming queue "${queue}". Consumer tag: ${consumeReply.consumerTag}`
    );

    return consumeReply.consumerTag;
  }

  /**
   * Stops consuming messages
   *
   * @param {string} consumerTag
   * @return {Promise<void>}
   */
  public async cancel(consumerTag: string): Promise<void> {
    const channel = await this.channel;
    if(channel) {
      await channel.cancel(consumerTag);
    }

    return;
  }

  /**
   * Process incoming message
   *
   * Override this method as you wish
   *
   * @param {Message} msg
   * @param {Channel} channel
   */
  public abstract processMessage(msg: Message, channel: Channel): void;
}
