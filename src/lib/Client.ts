import {Channel} from "amqplib";
import { Connection, createChannelCallback } from "./Connection";
import DevNullLogger from "./DevNullLogger";
import {ILogger} from "./ILogger";

/**
 * Abstract client connected to AMQP (can be publisher or consumer)
 */
export abstract class Client {

    protected logger: ILogger;
    protected conn: Connection;
    protected channel: Promise<Channel>;

    private channelCb: createChannelCallback;

    /**
     *
     * @param {Connection} conn
     * @param {createChannelCallback} channelCallback
     * @param {ILogger}logger
     */
    public constructor(conn: Connection, channelCallback: createChannelCallback, logger?: ILogger) {
        this.conn = conn;
        this.channelCb = channelCallback;

        if (!logger) {
            this.logger = new DevNullLogger();
        }

        this.openChannel();
    }

    /**
     * creates new channel and runs callback function, e.g. to create queues, exchanges etc.
     */
    private async openChannel(): Promise<void> {
        this.channel = this.conn.createChannel(this.channelCb);

        const ch: Channel = await this.channel;

        ch.on("close", (reason: any) => {
            this.logger.warn("Channel closed, Reason:", reason);
            this.openChannel();
        });

        ch.on("error", (reason: any) => {
            this.logger.error("Channel error, Reason:", reason);
            // will be handled by close event
        });
    }

}
