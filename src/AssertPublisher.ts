import {Channel, Options} from "amqplib";
import { createChannelCallback, default as AMQPConnection } from "./Connection";
import IPublisher from "./IPublisher";
import Publisher from "./Publisher";

/**
 * Example implementation of Publisher
 *
 * AssertionPublisher asserts queue before every sendToQueue call
 */
class AssertionPublisher extends Publisher implements IPublisher {

    /**
     *
     * @param {AMQPConnection} conn
     * @param {createChannelCallback} channelCallback
     * @param {Options.AssertQueue} assertQueueOptions
     */
    public constructor(
        conn: AMQPConnection,
        channelCallback: createChannelCallback,
        private assertQueueOptions: Options.AssertQueue = {},
    ) {
        super(conn, channelCallback);
    }

    /**
     * Send message directly to queue
     *
     * @param {string} queue
     * @param {Buffer} content
     * @param {object} options
     *
     * @return {Promise}
     */
    public async sendToQueue(queue: string, content: Buffer, options: {}): Promise<void> {
        await this.assertQueue(queue);

        return super.sendToQueue(queue, content, options);
    }

    /**
     *
     * @param {string} name
     * @return {Promise<Channel>}
     */
    private async assertQueue(name: string) {
        const channel: Channel = await this.channel;

        return channel.assertQueue(name, this.assertQueueOptions);
    }

}

export default AssertionPublisher;
