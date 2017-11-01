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
const Connection_1 = require("../../lib/Connection");
const Publisher_1 = require("../../lib/Publisher");
const config_1 = require("../config");
const chai_1 = require("chai");
require("mocha");
const conn = new Connection_1.default(config_1.rabbitMQOptions);
describe("Publisher", () => {
    it("should publish message", () => __awaiter(this, void 0, void 0, function* () {
        const channelMock = {
            publish: (exchange, routKey, content, options) => {
                chai_1.assert.equal(exchange, "some-ex");
                chai_1.assert.equal(routKey, "rk");
                chai_1.assert.equal(content.toString(), "test");
                chai_1.assert.deepEqual(options, { contentType: "text/plain", headers: { foo: "bar" } });
                return true;
            },
            on: () => false,
        };
        conn.createChannel = () => __awaiter(this, void 0, void 0, function* () { return channelMock; });
        const publisher = new Publisher_1.default(conn, () => Promise.resolve());
        yield publisher.publish("some-ex", "rk", new Buffer("test"), { contentType: "text/plain", headers: { foo: "bar" } });
        // nothing should have been buffered
        chai_1.assert.equal(publisher.cleanBuffer(), 0);
    }));
    it("should send message to queue", () => __awaiter(this, void 0, void 0, function* () {
        const channelMock = {
            publish: (exchange, routKey, content, options) => {
                chai_1.assert.equal(exchange, "");
                chai_1.assert.equal(routKey, "queue-name");
                chai_1.assert.equal(content.toString(), "test");
                chai_1.assert.deepEqual(options, { contentType: "text/plain", headers: { foo: "bar" } });
                return true;
            },
            on: () => false,
        };
        conn.createChannel = () => __awaiter(this, void 0, void 0, function* () { return channelMock; });
        const publisher = new Publisher_1.default(conn, () => Promise.resolve());
        yield publisher.sendToQueue("queue-name", new Buffer("test"), { contentType: "text/plain", headers: { foo: "bar" } });
        // nothing should have been buffered
        chai_1.assert.equal(publisher.cleanBuffer(), 0);
    }));
    it("should buffer messages and publish them when cleanBuffer is called", () => __awaiter(this, void 0, void 0, function* () {
        let i = 0;
        const limitedWriteStreamMock = () => {
            i++;
            return i > 3;
        };
        const channelMock = {
            publish: () => limitedWriteStreamMock(),
            on: () => false,
        };
        conn.createChannel = () => __awaiter(this, void 0, void 0, function* () { return channelMock; });
        const publisher = new Publisher_1.default(conn, () => Promise.resolve());
        chai_1.assert.equal(publisher.cleanBuffer(), 0);
        yield Promise.all([
            publisher.publish("exname", "routkey", new Buffer("content1"), {}),
            publisher.sendToQueue("queue", new Buffer("content2"), {}),
            publisher.publish("exname", "routkey", new Buffer("content3"), {}),
        ]);
        chai_1.assert.equal(publisher.cleanBuffer(), 3);
        chai_1.assert.equal(publisher.cleanBuffer(), 0);
    }));
});
//# sourceMappingURL=Publisher.test.js.map