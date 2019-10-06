import { Connection } from "../../lib/Connection";
import { Publisher } from "../../lib/Publisher";
import { rabbitMQOptions } from "../config";

import { assert } from "chai";
import "mocha";

const conn = new Connection(rabbitMQOptions);

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
            Buffer.from("test"),
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
            Buffer.from("test"),
            { contentType: "text/plain", headers: { foo: "bar" }},
        );

        // nothing should have been buffered
        assert.equal(publisher.cleanBuffer(), 0);
    });

    // TODO - buffering of messages when published returned false is done on amqplib level
    it.skip("should buffer messages and publish them when cleanBuffer is called", async () => {
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
            publisher.publish("exname", "routkey", Buffer.from("content1"), {}),
            publisher.sendToQueue("queue", Buffer.from("content2"), {}),
            publisher.publish("exname", "routkey", Buffer.from("content3"), {}),
        ]);

        assert.equal(publisher.cleanBuffer(), 3);
        assert.equal(publisher.cleanBuffer(), 0);
    });

});
