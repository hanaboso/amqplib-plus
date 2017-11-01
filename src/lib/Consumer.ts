import {Channel} from "amqplib";
import { Message, Options, Replies } from "amqplib/properties";
import Client from "./Client";

/**
 * Consumer class to be overridden by your custom implementation with custom processMessage function
 */
abstract class Consumer extends Client {

    /**
     * Start consuming messages from queue
     * Resolves promise when the consumption is ready
     *
     * @return {Promise}
     */
    public async consume(queue: string, options: Options.Consume): Promise<Replies.Consume> {
        const fallback = () => this.consume(queue, options);

        const processFn = (msg: Message) => {
            this.processMessage(msg, channel);
        };

        const channel: Channel = await this.channel;

        channel.on("close", () => {
            // Wait a while until new connection is established and the start consumption again
            setTimeout(fallback, 200);
        });

        const consumeReply: Replies.Consume = await channel.consume(queue, processFn, options);

        console.info(`Started consuming queue "${queue}". Consumption tag: ${consumeReply.consumerTag}`);

        return consumeReply;

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

export default Consumer;
