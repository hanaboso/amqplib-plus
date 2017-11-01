"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Consumer_1 = require("./Consumer");
/**
 * Example implementation of Consumer
 *
 * Simple consumers automatically acks amqp message when consumed
 */
class SimpleConsumer extends Consumer_1.default {
    /**
     *
     * @param {Connection} conn
     * @param {(ch: Channel) => Promise<void>} channelCb
     * @param {(msg: Message) => void} processData
     */
    constructor(conn, channelCb, processData) {
        super(conn, channelCb);
        this.processData = processData;
    }
    /**
     * Passes message to defined process function and acks amqp message
     *
     * @param {Message} msg
     * @param {Channel} channel
     */
    processMessage(msg, channel) {
        this.processData(msg);
        channel.ack(msg);
    }
}
exports.default = SimpleConsumer;
//# sourceMappingURL=SimpleConsumer.js.map