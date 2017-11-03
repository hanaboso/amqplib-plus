import { Channel, Message } from "amqplib";
import { Connection } from "../../lib/Connection";
import { Publisher } from "../../lib/Publisher";
import { SimpleConsumer } from "../../lib/SimpleConsumer";
import { rabbitMQOptions } from "../config";

import { assert } from "chai";
import "mocha";

const conn = new Connection(rabbitMQOptions);

describe("Publish Consume", () => {

    it("should publish and consume single message", (done) => {
        const testQueue = {
            name: "test_queue_single",
            options: {},
        };
        const testContent = "test content";

        const publisherPrepare: any = (ch: Channel) => {
            return ch.assertQueue(testQueue.name, testQueue.options);
        };
        const consumerPrepare: any = (ch: Channel) => {
            return ch.assertQueue(testQueue.name, testQueue.options);
        };

        const publisher = new Publisher(conn, publisherPrepare);
        const assertFn = (msg: Message) => {
            assert.equal(msg.content.toString(), testContent);
            done();
        };
        const consumer = new SimpleConsumer(conn, consumerPrepare, assertFn);

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

        const publisherPrepare: any = (ch: Channel) => {
            return ch.assertQueue(testQueue.name, testQueue.options);
        };
        const consumerPrepare: any = (ch: Channel) => {
            return ch.assertQueue(testQueue.name, testQueue.options);
        };

        const publisher = new Publisher(conn, publisherPrepare);
        const assertFn = (msg: Message) => {
            assert.equal(msg.content.toString(), "some content");
            msgReceived++;
            if (msgReceived === msgSent) {
                done();
            }
        };
        const consumer = new SimpleConsumer(conn, consumerPrepare, assertFn);

        consumer.consume(testQueue.name, {});
        for (let i = 0; i < msgSent; i++) {
            publisher.sendToQueue(testQueue.name, new Buffer("some content"), {});
        }
    });

});
