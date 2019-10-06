import { Replies } from "amqplib/properties";

import { Connection } from "@src/Connection";

import { SimpleConsumer } from "../common/consumer/SimpleConsumer";
import { rabbitMQOptions } from "../config";

const conn = new Connection(rabbitMQOptions);

describe("Consumer", () => {
  it("should call channel's consume and cancel methods", async () => {
    let consumeCalled = false;
    let cancelCalled = false;

    const channelMock: any = {
      consume: (): Promise<Replies.Consume> => {
        consumeCalled = true;

        return Promise.resolve({ consumerTag: "consumerTagValue" });
      },
      cancel: (consumerTag: string): Promise<void> => {
        expect(consumerTag).toEqual("consumerTagValue");
        cancelCalled = true;

        return Promise.resolve();
      },
      on: () => false
    };
    conn.createChannel = async () => channelMock;
    const consumer = new SimpleConsumer(
      conn,
      () => Promise.resolve(),
      () => null
    );

    const tag = await consumer.consume("queue-name", {});
    await consumer.cancel(tag);

    expect(consumeCalled).toBe(true);
    expect(cancelCalled).toBe(true);
  });
});
