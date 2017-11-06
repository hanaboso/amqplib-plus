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
export class Connection {

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
    public createChannel(prepareFn: createChannelCallback): Promise<amqp.Channel> {
        return new Promise((resolve) => {
            let tryCount: number = 1;

            const reconnect: (reason: any) => void = (reason) => {
                const wait: number = Math.min(WAIT_MS * tryCount, WAIT_MAX_MS); // wait max 5 min

                console.error(`Channel creation failed. Retry after ${wait} ms. Reason: ${reason}`);

                setTimeout(tryConnect, wait);
                tryCount += 1;
            };

            let channel: amqp.Channel;
            const tryConnect: () => void = () => this.connection
                .then((connection) => {
                    return connection.createChannel();
                })
                .then((ch: amqp.Channel) => {
                    channel = ch;
                    return prepareFn(ch);
                })
                .then(() => {
                    return resolve(channel);
                })
                .catch(reconnect);

            tryConnect();
        });
    }

    /**
     * Creates new connection promise to RabbitMQ
     */
    private createConnection(): Promise<amqp.Connection> {
        return new Promise((resolve/* , reject*/) => {
            let tryCount = 1;

            const reconnect: (error: any) => void = (error) => {
                /* try forever
                if (tryCount >= (WAIT_MAX_MS / WAIT_MS) + WAIT_LIMIT) { // 5 min + 2 h
                  reject(`Maximum (${tryCount}) reconnection attempts reached.`);
                }*/

                const wait: number = Math.min(WAIT_MS * tryCount, WAIT_MAX_MS); // wait max 5 min

                console.error(`RabbitMQ connection failure. Retry after ${wait} ms. Reason: ${error.message}`);

                setTimeout(tryConnect, wait);
                tryCount += 1;
            };

            const tryConnect: () => void = () => amqp.connect(this.connStr, { heartbeat: this.heartbeat })
                .then((connection) => {
                    connection.on("close", (error) => {
                        console.warn("AMQP Connection closed", error ? error.message : "");
                        this.connection = this.createConnection();
                    });
                    connection.on("error", (error) => {
                        console.error("AMQP Connection error", error ? error.message : "");
                        // will be handled by close event
                    });
                    console.info("Connected to RabbitMQ.");
                    resolve(connection);
                })
                .catch(reconnect);

            tryConnect();
        });
    }
}
