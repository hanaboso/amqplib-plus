import { default as AMQPConnection } from "../../src/Connection";
import Publisher from "../../src/Publisher";
import {rabbitMQOptions} from "../config";

import { assert } from "chai";
import "mocha";

const conn = new AMQPConnection(rabbitMQOptions);

describe("Publisher", () => {

    it("should publish message", async () => {
        const channelMock: any = {
            publish: (exchange: string, routKey: string, content: Buffer, options: {}) => {
                assert.equal(exchange, "some-ex");
                assert.equal(routKey, "rk");
                assert.equal(content.toString(), "test");
                assert.deepEqual(options, { contentType: "text/plain", headers: { foo: "bar" }});

                return true;
            },
            on: () => false,
        };
        conn.createChannel = async () => channelMock;
        const publisher = new Publisher(conn, () => Promise.resolve());

        await publisher.publish(
            "some-ex",
            "rk",
            new Buffer("test"),
            { contentType: "text/plain", headers: { foo: "bar" }},
        );

        // nothing should have been buffered
        assert.equal(publisher.cleanBuffer(), 0);
    });

    it("should send message to queue", async () => {
        const channelMock: any = {
            publish: (exchange: string, routKey: string, content: Buffer, options: {}) => {
                assert.equal(exchange, "");
                assert.equal(routKey, "queue-name");
                assert.equal(content.toString(), "test");
                assert.deepEqual(options, { contentType: "text/plain", headers: { foo: "bar" }});

                return true;
            },
            on: () => false,
        };
        conn.createChannel = async () => channelMock;
        const publisher = new Publisher(conn, () => Promise.resolve());

        await publisher.sendToQueue(
            "queue-name",
            new Buffer("test"),
            { contentType: "text/plain", headers: { foo: "bar" }},
        );

        // nothing should have been buffered
        assert.equal(publisher.cleanBuffer(), 0);
    });

    it("should buffer messages and publish them when cleanBuffer is called", async () => {
        let i: number = 0;
        const limitedWriteStreamMock = () => {
            i++;
            return i > 3;
        };
        const channelMock: any = {
            publish: () => limitedWriteStreamMock(),
            on: () => false,
        };
        conn.createChannel = async () => channelMock;

        const publisher = new Publisher(conn, () => Promise.resolve());
        assert.equal(publisher.cleanBuffer(), 0);

        await Promise.all([
            publisher.publish("exname", "routkey", new Buffer("content1"), {}),
            publisher.sendToQueue("queue", new Buffer("content2"), {}),
            publisher.publish("exname", "routkey", new Buffer("content3"), {}),
        ]);

        assert.equal(publisher.cleanBuffer(), 3);
        assert.equal(publisher.cleanBuffer(), 0);
    });

});
