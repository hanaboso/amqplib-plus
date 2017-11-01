import { Channel, Message } from "amqplib";
import Connection from "./Connection";
import Consumer from "./Consumer";

/**
 * Example implementation of Consumer
 *
 * Simple consumers automatically acks amqp message when consumed
 */
class SimpleConsumer extends Consumer {

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
        this.processData(msg);
        channel.ack(msg);
    }

}

export default SimpleConsumer;
