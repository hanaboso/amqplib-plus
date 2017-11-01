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
const amqp = require("amqplib");
const WAIT_MS = 2000;
const WAIT_MAX_MS = 300000; // 5 * 60 * 1000 = 5 min
/**
 * Logical wrap for AMQP connection
 */
class Connection {
    /**
     *
     * @param {IConnectionOptions} opts
     */
    constructor(opts) {
        this.connStr = `amqp://${opts.user}:${opts.pass}@${opts.host}:${opts.port}${opts.vhost}`;
        this.heartbeat = opts.heartbeat;
        this.connection = this.createConnection();
    }
    /**
     * Returns promise with current amqp connection
     */
    connect() {
        return this.connection;
    }
    /**
     * Returns promise of channel with applied functions on the channel
     */
    createChannel(prepareChannel) {
        return __awaiter(this, void 0, void 0, function* () {
            let tries = 1;
            let channel;
            const recreateChannel = (reason) => {
                console.error(`RabbitMQ channel failed. Reason: ${reason.message}`);
                const wait = Math.min(WAIT_MS * tries, WAIT_MAX_MS);
                setTimeout(tryCreateChannel, wait);
                tries += 1;
            };
            const tryCreateChannel = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const conn = yield this.connection;
                    channel = yield conn.createChannel();
                    yield prepareChannel(channel);
                    return channel;
                }
                catch (err) {
                    recreateChannel(err);
                }
            });
            yield tryCreateChannel();
            return channel;
        });
    }
    /**
     * Creates new connection to RabbitMQ promise
     */
    createConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            let tryCount = 1;
            const reconnect = (error) => {
                console.error(`RabbitMQ connection failed. Reason: ${error.message}`);
                const wait = Math.min(WAIT_MS * tryCount, WAIT_MAX_MS);
                setTimeout(tryConnect, wait);
                tryCount += 1;
            };
            const tryConnect = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    connection = yield amqp.connect(this.connStr, { heartbeat: this.heartbeat });
                    connection.on("close", (error) => {
                        console.warn("AMQP Connection closed", error ? error.message : "");
                        this.connection = this.createConnection();
                    });
                    connection.on("error", (error) => {
                        console.error("AMQP Connection error", error ? error.message : "");
                        // will be handled by close event
                    });
                    console.debug("Connected to RabbitMQ.");
                }
                catch (err) {
                    reconnect(err);
                }
            });
            yield tryConnect();
            return connection;
        });
    }
}
exports.default = Connection;
//# sourceMappingURL=Connection.js.map