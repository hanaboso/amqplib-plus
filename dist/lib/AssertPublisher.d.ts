/// <reference types="node" />
import { Options } from "amqplib";
import { createChannelCallback, default as AMQPConnection } from "./Connection";
import IPublisher from "./IPublisher";
import Publisher from "./Publisher";
/**
 * Example implementation of Publisher
 *
 * AssertionPublisher asserts queue before every sendToQueue call
 */
declare class AssertionPublisher extends Publisher implements IPublisher {
    private assertQueueOptions;
    /**
     *
     * @param {AMQPConnection} conn
     * @param {createChannelCallback} channelCallback
     * @param {Options.AssertQueue} assertQueueOptions
     */
    constructor(conn: AMQPConnection, channelCallback: createChannelCallback, assertQueueOptions?: Options.AssertQueue);
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
     *
     * @param {string} name
     * @return {Promise<Channel>}
     */
    private assertQueue(name);
}
export default AssertionPublisher;
