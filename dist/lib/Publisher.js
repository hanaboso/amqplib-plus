"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = require("./Client");
/**
 * Basic RabbitMQ Publisher implementation
 */
class Publisher extends Client_1.default {
    /**
     *
     * @param {Connection} conn
     * @param {createChannelCallback} channelCallback
     */
    constructor(conn, channelCallback) {
        super(conn, channelCallback);
        this.drainBuffer = [];
        this.hookDrainEvent();
    }
    /**
     * Publish message to exchange
     *
     * @param {string} exchange
     * @param {string} routKey
     * @param {Buffer} content
     * @param {Options.Publish} options
     *
     * @return {Promise}
     */
    publish(exchange, routKey, content, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.channel;
            const sent = channel.publish(exchange, routKey, content, options);
            if (sent) {
                return;
            }
            console.warn("Could not publish message, is write stream full? Buffering.");
            this.drainBuffer.push({ exchange, routKey, content, options });
        });
    }
    /**
     * Send message directly to queue
     *
     * @param {string} queue
     * @param {Buffer} content
     * @param {object} options
     *
     * @return {Promise}
     */
    sendToQueue(queue, content, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.publish("", queue, content, options);
        });
    }
    /**
     * Republish all buffered messages
     */
    cleanBuffer() {
        let reSent = 0;
        while (this.drainBuffer.length > 0) {
            const buf = this.drainBuffer.pop();
            this.publish(buf.exchange, buf.routKey, buf.content, buf.options);
            reSent++;
        }
        return reSent;
    }
    /**
     * Add drain event listener
     *
     * @return {Promise<void>}
     */
    hookDrainEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const ch = yield this.channel;
            ch.on("drain", () => {
                console.warn(`AMQP channel Drain Event. Going to resend ${this.drainBuffer.length} messages`);
                this.cleanBuffer();
            });
        });
    }
}
exports.default = Publisher;
//# sourceMappingURL=Publisher.js.map