import {Channel, ConfirmChannel, Options} from "amqplib";
import {Client} from "./Client";
import {Connection, createChannelCallback} from "./Connection";
import {IPublisher} from "./IPublisher";

interface IDrainBufferItem {
    exchange: string;
    routKey: string;
    content: Buffer;
    options: Options.Publish;
}

/**
 * Basic RabbitMQ Publisher implementation
 */
export class Publisher extends Client implements IPublisher {

    private drainBuffer: IDrainBufferItem[] = [];

    /**
     *
     * @param {Connection} conn
     * @param {createChannelCallback} channelCallback
     * @param {boolean} useConfirmChannel
     */
    public constructor(conn: Connection, channelCallback: createChannelCallback, useConfirmChannel = false) {
        super(conn, channelCallback, useConfirmChannel);
        this.hookDrainEvent();
    }

    /**
     * Publish message to exchange
     *
     * @param {string} exchange
     * @param {string} routKey
     * @param {Buffer} content
     * @param {Options.Publish} options
     *
     * @return {Promise}
     */
    public async publish(exchange: string, routKey: string, content: Buffer, options: Options.Publish): Promise<void> {
        if (this.useConfirm) {
            const confChannel: any = await this.channel;

            return await this.publishConfirm(confChannel, exchange, routKey, content, options);
        }

        const channel: Channel = await this.channel;
        const sent = channel.publish(exchange, routKey, content, options);

        if (sent) {
            return;
        }

        // TODO - amqplib is buffering messages on it's own too
        // TODO - despite the publish() returns false, the message is sent
        // TODO - we must somehow distinguish between false but accept AND false and not accepted messages
        // this.logger.warn("Could not publish message, is write stream full? Buffering.");
        // this.drainBuffer.push({ exchange, routKey, content, options });
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
        return this.publish("", queue, content, options);
    }

    /**
     * Republish all buffered messages
     */
    public cleanBuffer(): number {
        let reSent = 0;

        while (this.drainBuffer.length > 0) {
            const buf: IDrainBufferItem = this.drainBuffer.pop();

            this.publish(buf.exchange, buf.routKey, buf.content, buf.options);
            reSent++;
        }

        return reSent;
    }

    /**
     *
     * @param {ConfirmChannel} confChannel
     * @param {string} exchange
     * @param {string} routKey
     * @param {Buffer} content
     * @param {Options.Publish} options
     * @return {Promise<void>}
     */
    private publishConfirm(
        confChannel: ConfirmChannel,
        exchange: string,
        routKey: string,
        content: Buffer,
        options: Options.Publish,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            confChannel.publish(exchange, routKey, content, options, (err) => {
                if (err !== null) {
                    return reject("Confirm Channel nacked publishing the message.");
                }

                return resolve();
            });
        });
    }

    /**
     * Add drain event listener
     *
     * @return {Promise<void>}
     */
    private async hookDrainEvent() {
        const ch: Channel = await this.channel;

        ch.on("drain", () => {
            this.logger.warn(`AMQP channel Drain Event. Going to resend ${this.drainBuffer.length} messages`);

            this.cleanBuffer();
        });
    }

}
