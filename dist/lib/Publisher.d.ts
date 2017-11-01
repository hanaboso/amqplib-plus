/// <reference types="node" />
import { Options } from "amqplib";
import Client from "./Client";
import { createChannelCallback, default as AMQPConnection } from "./Connection";
import IPublisher from "./IPublisher";
/**
 * Basic RabbitMQ Publisher implementation
 */
declare class Publisher extends Client implements IPublisher {
    private drainBuffer;
    /**
     *
     * @param {Connection} conn
     * @param {createChannelCallback} channelCallback
     */
    constructor(conn: AMQPConnection, channelCallback: createChannelCallback);
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
    publish(exchange: string, routKey: string, content: Buffer, options: Options.Publish): Promise<void>;
    /**
     * Send message directly to queue
     *
     * @param {string} queue
     * @param {Buffer} content
     * @param {object} options
     *
     * @return {Promise}
     */
    sendToQueue(queue: string, content: Buffer, options: {}): Promise<void>;
    /**
     * Republish all buffered messages
     */
    cleanBuffer(): number;
    /**
     * Add drain event listener
     *
     * @return {Promise<void>}
     */
    private hookDrainEvent();
}
export default Publisher;
