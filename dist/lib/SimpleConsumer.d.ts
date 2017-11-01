import { Channel, Message } from "amqplib";
import Connection from "./Connection";
import Consumer from "./Consumer";
/**
 * Example implementation of Consumer
 *
 * Simple consumers automatically acks amqp message when consumed
 */
declare class SimpleConsumer extends Consumer {
    private processData;
    /**
     *
     * @param {Connection} conn
     * @param {(ch: Channel) => Promise<void>} channelCb
     * @param {(msg: Message) => void} processData
     */
    constructor(conn: Connection, channelCb: (ch: Channel) => Promise<void>, processData: (msg: Message) => void);
    /**
     * Passes message to defined process function and acks amqp message
     *
     * @param {Message} msg
     * @param {Channel} channel
     */
    processMessage(msg: Message, channel: Channel): void;
}
export default SimpleConsumer;
