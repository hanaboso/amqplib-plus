import * as amqp from "amqplib";
export interface IConnectionOptions {
    user: string;
    pass: string;
    host: string;
    port: number;
    vhost: string;
    heartbeat: number;
}
export declare type createChannelCallback = (ch: amqp.Channel) => Promise<void>;
/**
 * Logical wrap for AMQP connection
 */
declare class Connection {
    private connStr;
    private heartbeat;
    private connection;
    /**
     *
     * @param {IConnectionOptions} opts
     */
    constructor(opts: IConnectionOptions);
    /**
     * Returns promise with current amqp connection
     */
    connect(): Promise<amqp.Connection>;
    /**
     * Returns promise of channel with applied functions on the channel
     */
    createChannel(prepareChannel: createChannelCallback): Promise<amqp.Channel>;
    /**
     * Creates new connection to RabbitMQ promise
     */
    private createConnection();
}
export default Connection;
