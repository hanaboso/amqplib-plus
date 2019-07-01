import { Replies } from "amqplib/properties";
import { Connection } from "../../lib/Connection";
import { Consumer } from "../../lib/Consumer";
import { SimpleConsumer } from "../common/consumer/SimpleConsumer";
import { rabbitMQOptions } from "../config";

import { assert } from "chai";
import "mocha";

const conn = new Connection(rabbitMQOptions);

describe("Consumer", () => {

    it("should call channel's consume and cancel methods", async () => {
        let consumeCalled = false;
        let cancelCalled = false;

        const channelMock: any = {
            consume: (): Promise<Replies.Consume> => {
                consumeCalled = true;

                return Promise.resolve({consumerTag: "consumerTagValue"});
            },
            cancel: (consumerTag: string): Promise<void> => {
                assert.equal(consumerTag, "consumerTagValue");
                cancelCalled = true;

                return Promise.resolve();
            },
            on: () => false,
        };
        conn.createChannel = async () => channelMock;
        const consumer = new SimpleConsumer(conn, () => Promise.resolve(), () => null);

        const tag = await consumer.consume("queue-name", {});
        await consumer.cancel(tag);

        assert.isTrue(consumeCalled);
        assert.isTrue(cancelCalled);
    });

});
