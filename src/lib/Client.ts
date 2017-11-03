import {Channel} from "amqplib";
import { Connection, createChannelCallback } from "./Connection";

/**
 * Abstract client connected to AMQP (can be publisher or consumer)
 */
export abstract class Client {

    protected conn: Connection;
    protected channel: Promise<Channel>;

    private channelCb: createChannelCallback;

    /**
     *
     * @param {Connection} conn
     * @param {createChannelCallback} channelCallback
     */
    public constructor(conn: Connection, channelCallback: createChannelCallback) {
        this.conn = conn;
        this.channelCb = channelCallback;

        this.openChannel();
    }

    /**
     * creates new channel and runs callback function, e.g. to create queues, exchanges etc.
     */
    private async openChannel(): Promise<void> {
        this.channel = this.conn.createChannel(this.channelCb);

        const ch: Channel = await this.channel;

        ch.on("close", (reason: any) => {
            console.warn("Channel closed, Reason:", reason);
            this.openChannel();
        });

        ch.on("error", (reason: any) => {
            console.error("Channel error, Reason:", reason);
            // will be handled by close event
        });
    }

}
