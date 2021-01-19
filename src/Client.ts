import { Channel, ConfirmChannel } from "amqplib";

import { Connection, createChannelCallback } from "./Connection";
import DevNullLogger from "./DevNullLogger";
import { ILogger } from "./ILogger";

/**
 * Abstract client connected to AMQP (can be publisher or consumer)
 */
export abstract class Client {
  protected logger: ILogger;
  protected conn: Connection;
  protected channel: Promise<ConfirmChannel | Channel>;
  protected useConfirm: boolean;
  protected recreateChannel: boolean = true;
  protected reuseChannel: boolean;

  private channelCb: createChannelCallback;

  /**
   *
   * @param {Connection} conn
   * @param {createChannelCallback} channelCallback
   * @param {boolean} useConfirmChannel
   * @param {ILogger}logger
   * @param {boolean}reuseChannel
   */
  public constructor(
    conn: Connection,
    channelCallback: createChannelCallback,
    useConfirmChannel = false,
    logger?: ILogger,
    reuseChannel: boolean = false
  ) {
    this.conn = conn;
    this.channelCb = channelCallback;
    this.useConfirm = useConfirmChannel;
    this.reuseChannel = reuseChannel;

    if (logger) {
      this.logger = logger;
    } else {
      this.logger = new DevNullLogger();
    }

    this.openChannel(reuseChannel);
  }

  /**
   * Sets whether the channel should be automatically recreated when closed
   * @param should
   */
  public shouldRecreateChannel(should: boolean) {
    this.recreateChannel = should;
  }

  /**
   * creates new channel and runs callback function, e.g. to create queues, exchanges etc.
   */
  private async openChannel(reuseChannel: boolean): Promise<void> {
    this.channel = this.conn.createChannel(this.channelCb, this.useConfirm, reuseChannel);

    const ch: Channel = await this.channel;

    ch.on("close", (reason: any) => {
      this.logger.warn("Channel closed, Reason:", reason);
      if (this.recreateChannel) {
        this.openChannel(false);
      }
    });

    ch.on("error", (reason: any) => {
      this.logger.error("Channel error, Reason:", reason);
      // will be handled by close event
    });
  }
}
