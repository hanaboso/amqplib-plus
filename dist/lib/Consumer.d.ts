import { Channel } from "amqplib";
import { Message, Options, Replies } from "amqplib/properties";
import Client from "./Client";
/**
 * Consumer class to be overridden by your custom implementation with custom processMessage function
 */
declare abstract class Consumer extends Client {
    /**
     * Start consuming messages from queue
     * Resolves promise when the consumption is ready
     *
     * @return {Promise}
     */
    consume(queue: string, options: Options.Consume): Promise<Replies.Consume>;
    /**
     * Process incoming message
     *
     * Override this method as you wish
     *
     * @param {Message} msg
     * @param {Channel} channel
     */
    abstract processMessage(msg: Message, channel: Channel): void;
}
export default Consumer;
