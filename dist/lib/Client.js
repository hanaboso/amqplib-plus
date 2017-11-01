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
/**
 * Abstract client connected to AMQP (can be publisher or consumer)
 */
class Client {
    /**
     *
     * @param {AMQPConnection} conn
     * @param {createChannelCallback} channelCallback
     */
    constructor(conn, channelCallback) {
        this.conn = conn;
        this.channelCb = channelCallback;
        this.openChannel();
    }
    /**
     * creates new channel and runs callback function, e.g. to create queues, exchanges etc.
     */
    openChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            this.channel = this.conn.createChannel(this.channelCb);
            const ch = yield this.channel;
            ch.on("close", (reason) => {
                console.warn("Channel closed, Reason:", reason);
                this.openChannel();
            });
            ch.on("error", (reason) => {
                console.error("Channel error, Reason:", reason);
                // will be handled by close event
            });
        });
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map