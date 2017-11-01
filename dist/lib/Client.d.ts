import { Channel } from "amqplib";
import { createChannelCallback, default as AMQPConnection } from "./Connection";
/**
 * Abstract client connected to AMQP (can be publisher or consumer)
 */
declare abstract class Client {
    protected conn: AMQPConnection;
    protected channel: Promise<Channel>;
    private channelCb;
    /**
     *
     * @param {AMQPConnection} conn
     * @param {createChannelCallback} channelCallback
     */
    constructor(conn: AMQPConnection, channelCallback: createChannelCallback);
    /**
     * creates new channel and runs callback function, e.g. to create queues, exchanges etc.
     */
    private openChannel();
}
export default Client;
