import * as amqp from "amqplib";

const WAIT_MS: number = 2000;
const WAIT_MAX_MS: number = 300000; // 5 * 60 * 1000 = 5 min

export interface IConnectionOptions {
    user: string;
    pass: string;
    host: string;
    port: number;
    vhost: string;
    heartbeat: number;
}

export type createChannelCallback = (ch: amqp.Channel) => Promise<void>;

/**
 * Logical wrap for AMQP connection
 */
class Connection {

    private connStr: string;
    private heartbeat: number;
    private connection: Promise<amqp.Connection>;

    /**
     *
     * @param {IConnectionOptions} opts
     */
    constructor(opts: IConnectionOptions) {
        this.connStr = `amqp://${opts.user}:${opts.pass}@${opts.host}:${opts.port}${opts.vhost}`;
        this.heartbeat = opts.heartbeat;

        this.connection = this.createConnection();
    }

    /**
     * Returns promise with current amqp connection
     */
    public connect(): Promise<amqp.Connection> {
        return this.connection;
    }

    /**
     * Returns promise of channel with applied functions on the channel
     */
    public async createChannel(prepareChannel: createChannelCallback): Promise<amqp.Channel> {
        let tries: number = 1;
        let channel: amqp.Channel;

        const recreateChannel: (reason: any) => void = (reason) => {
            console.error(`RabbitMQ channel failed. Reason: ${reason.message}`);

            const wait: number = Math.min(WAIT_MS * tries, WAIT_MAX_MS);
            setTimeout(tryCreateChannel, wait);
            tries += 1;
        };

        const tryCreateChannel: () => void = async () => {
            try {
                const conn: amqp.Connection = await this.connection;
                channel = await conn.createChannel();
                await prepareChannel(channel);

                return channel;
            } catch (err) {
                recreateChannel(err);
            }
        };

        await tryCreateChannel();

        return channel;
    }

    /**
     * Creates new connection to RabbitMQ promise
     */
    private async createConnection(): Promise<amqp.Connection> {
        let connection: amqp.Connection;
        let tryCount = 1;

        const reconnect: (error: any) => void = (error) => {
            console.error(`RabbitMQ connection failed. Reason: ${error.message}`);
            const wait: number = Math.min(WAIT_MS * tryCount, WAIT_MAX_MS);
            setTimeout(tryConnect, wait);
            tryCount += 1;
        };

        const tryConnect: () => void = async () => {
            try {
                connection = await amqp.connect(this.connStr, { heartbeat: this.heartbeat });

                connection.on("close", (error) => {
                    console.warn("AMQP Connection closed", error ? error.message : "");
                    this.connection = this.createConnection();
                });

                connection.on("error", (error) => {
                    console.error("AMQP Connection error", error ? error.message : "");
                    // will be handled by close event
                });

                console.debug("Connected to RabbitMQ.");
            } catch (err) {
                reconnect(err);
            }
        };

        await tryConnect();

        return connection;
    }
}

export default Connection;
