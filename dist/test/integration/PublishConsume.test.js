"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Connection_1 = require("../../src/Connection");
const Publisher_1 = require("../../src/Publisher");
const SimpleConsumer_1 = require("../../src/SimpleConsumer");
const config_1 = require("../config");
const chai_1 = require("chai");
require("mocha");
const conn = new Connection_1.default(config_1.rabbitMQOptions);
describe("Publish Consume", () => {
    it("should publish and consume single message", (done) => {
        const testQueue = {
            name: "test_queue_single",
            options: {},
        };
        const testContent = "test content";
        const publisherPrepare = (ch) => {
            return ch.assertQueue(testQueue.name, testQueue.options);
        };
        const consumerPrepare = (ch) => {
            return ch.assertQueue(testQueue.name, testQueue.options);
        };
        const publisher = new Publisher_1.default(conn, publisherPrepare);
        const assertFn = (msg) => {
            chai_1.assert.equal(msg.content.toString(), testContent);
            done();
        };
        const consumer = new SimpleConsumer_1.default(conn, consumerPrepare, assertFn);
        consumer.consume(testQueue.name, {});
        publisher.sendToQueue(testQueue.name, new Buffer(testContent), {});
    });
    it("should publish and consume multiple messages", (done) => {
        let msgReceived = 0;
        const msgSent = 5;
        const testQueue = {
            name: "test_queue_multiple",
            options: {},
        };
        const publisherPrepare = (ch) => {
            return ch.assertQueue(testQueue.name, testQueue.options);
        };
        const consumerPrepare = (ch) => {
            return ch.assertQueue(testQueue.name, testQueue.options);
        };
        const publisher = new Publisher_1.default(conn, publisherPrepare);
        const assertFn = (msg) => {
            chai_1.assert.equal(msg.content.toString(), "some content");
            msgReceived++;
            if (msgReceived === msgSent) {
                done();
            }
        };
        const consumer = new SimpleConsumer_1.default(conn, consumerPrepare, assertFn);
        consumer.consume(testQueue.name, {});
        for (let i = 0; i < msgSent; i++) {
            publisher.sendToQueue(testQueue.name, new Buffer("some content"), {});
        }
    });
});
//# sourceMappingURL=PublishConsume.test.js.map