import * as amqp from "amqplib";

import DevNullLogger from "./DevNullLogger";
import { ILogger } from "./ILogger";

const WAIT_MS: number = 2000;
const WAIT_MAX_MS: number = 300000; // 5 * 60 * 1000 = 5 min

export interface IConnectionOptions {
  connectionString?: string;
  user?: string;
  pass?: string;
  host?: string;
  port?: number;
  vhost?: string;
  heartbeat?: number;
}

export type createChannelCallback = (ch: amqp.Channel) => Promise<void>;

/**
 * Logical wrap for AMQP connection
 */
export class Connection {
  private connStr: string;
  private connection: Promise<amqp.Connection>;
  private recreateConnection: boolean = true;

  /**
   *
   * @param {IConnectionOptions} opts
   * @param {ILogger} logger
   */
  constructor(opts: IConnectionOptions, private logger?: ILogger) {
    if (opts.connectionString) {
      this.connStr = opts.connectionString;
    } else {
      this.connStr = `amqp://${opts.user}:${opts.pass}@${opts.host}:${
        opts.port
      }${opts.vhost || "/"}`;
      this.connStr += `?heartbeat=${opts.heartbeat || 60}`;
    }

    if (!logger) {
      this.logger = new DevNullLogger();
    }

    this.connection = this.createConnection();
  }

  /**
   * Returns promise with current amqp connection
   */
  public connect(): Promise<amqp.Connection> {
    return this.connection;
  }

  /**
   * Retursn the actal connection string being used
   */
  public getConnectionString(): string {
    return this.connStr;
  }

  /**
   * Sets whether the connection should be automatically recreated when closed
   * @param should
   */
  public shouldRecreateConnection(should: boolean) {
    this.recreateConnection = should;
  }

  /**
   * Closes the connection
   * Note: forces this.recreateChannel to be false
   */
  public async close(): Promise<void> {
    this.shouldRecreateConnection(false);
    const conn = await this.connection;
    await conn.close();
  }

  /**
   * Returns promise of channel with applied functions on the channel
   */
  public createChannel(
    prepareFn: createChannelCallback,
    useConfirmChannel = true
  ): Promise<amqp.Channel | amqp.ConfirmChannel> {
    return new Promise(resolve => {
      let tryCount: number = 1;

      const reconnect: (reason: any) => void = reason => {
        const wait: number = Math.min(WAIT_MS * tryCount, WAIT_MAX_MS); // wait max 5 min

        this.logger.error(
          `Channel creation failed. Retry after ${wait} ms. Reason: ${reason}`
        );

        setTimeout(tryConnect, wait);
        tryCount += 1;
      };

      let channel: amqp.Channel;
      const tryConnect: () => void = () =>
        this.connection
          .then(connection => {
            if (useConfirmChannel) {
              return connection.createConfirmChannel();
            }
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
    return new Promise((resolve /* , reject*/) => {
      let tryCount = 1;

      const reconnect: (error: any) => void = error => {
        /* try forever
                if (tryCount >= (WAIT_MAX_MS / WAIT_MS) + WAIT_LIMIT) { // 5 min + 2 h
                  reject(`Maximum (${tryCount}) reconnection attempts reached.`);
                }*/

        const wait: number = Math.min(WAIT_MS * tryCount, WAIT_MAX_MS); // wait max 5 min

        this.logger.error(
          `RabbitMQ connection failure. Retry after ${wait} ms. Reason: ${error.message}`
        );

        setTimeout(tryConnect, wait);
        tryCount += 1;
      };

      const tryConnect: () => void = () =>
        amqp
          .connect(this.connStr)
          .then(connection => {
            connection.on("close", error => {
              this.logger.warn(
                "AMQP Connection closed",
                error ? error.message : ""
              );
              if (this.recreateConnection) {
                this.connection = this.createConnection();
              }
            });
            connection.on("error", error => {
              this.logger.error(
                "AMQP Connection error",
                error ? error.message : ""
              );
              // will be handled by close event
            });
            this.logger.info("Connected to RabbitMQ.");
            resolve(connection);
          })
          .catch(reconnect);

      tryConnect();
    });
  }
}
