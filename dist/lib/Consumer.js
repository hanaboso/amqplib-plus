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
 * Consumer class to be overridden by your custom implementation with custom processMessage function
 */
class Consumer extends Client_1.default {
    /**
     * Start consuming messages from queue
     * Resolves promise when the consumption is ready
     *
     * @return {Promise}
     */
    consume(queue, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const fallback = () => this.consume(queue, options);
            const processFn = (msg) => {
                this.processMessage(msg, channel);
            };
            const channel = yield this.channel;
            channel.on("close", () => {
                // Wait a while until new connection is established and the start consumption again
                setTimeout(fallback, 200);
            });
            const consumeReply = yield channel.consume(queue, processFn, options);
            console.info(`Started consuming queue "${queue}". Consumption tag: ${consumeReply.consumerTag}`);
            return consumeReply;
        });
    }
}
exports.default = Consumer;
//# sourceMappingURL=Consumer.js.map