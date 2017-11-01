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
const Publisher_1 = require("./Publisher");
/**
 * Example implementation of Publisher
 *
 * AssertionPublisher asserts queue before every sendToQueue call
 */
class AssertionPublisher extends Publisher_1.default {
    /**
     *
     * @param {AMQPConnection} conn
     * @param {createChannelCallback} channelCallback
     * @param {Options.AssertQueue} assertQueueOptions
     */
    constructor(conn, channelCallback, assertQueueOptions = {}) {
        super(conn, channelCallback);
        this.assertQueueOptions = assertQueueOptions;
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
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assertQueue(queue);
            return _super("sendToQueue").call(this, queue, content, options);
        });
    }
    /**
     *
     * @param {string} name
     * @return {Promise<Channel>}
     */
    assertQueue(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.channel;
            return channel.assertQueue(name, this.assertQueueOptions);
        });
    }
}
exports.default = AssertionPublisher;
//# sourceMappingURL=AssertPublisher.js.map