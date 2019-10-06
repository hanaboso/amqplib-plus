import { Channel, Message } from "amqplib";
import { Connection } from "../../../lib/Connection";
import { Consumer } from "../../../lib/Consumer";

/**
 * Example implementation of Consumer
 * For real usage create your own class extending the Consumer class
 * Use it in tests only
 *
 * Simple consumers automatically acks amqp message when consumed
 */
export class SimpleConsumer extends Consumer {

    private processData: (msg: Message) => void;

    /**
     *
     * @param {Connection} conn
     * @param {(ch: Channel) => Promise<void>} channelCb
     * @param {(msg: Message) => void} processData
     */
    constructor(
        conn: Connection,
        channelCb: (ch: Channel) => Promise<void>,
        processData: (msg: Message) => void,
    ) {
        super(conn, channelCb);
        this.processData = processData;
    }

    /**
     * Passes message to defined process function and acks amqp message
     *
     * @param {Message} msg
     * @param {Channel} channel
     */
    public processMessage(msg: Message, channel: Channel): void {
        try {
            this.processData(msg);
            channel.ack(msg);
        } catch (e) {
            channel.reject(msg);
        }
    }

}
