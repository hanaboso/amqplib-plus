import { Replies } from "amqplib/properties";

import { Connection } from "@src/Connection";

import { SimpleConsumer } from "../common/consumer/SimpleConsumer";
import { rabbitMQOptions } from "../config";

describe("Consumer", () => {
  let conn: Connection;

  beforeAll(() => {
    conn = new Connection(rabbitMQOptions);
  });

  afterAll(async () => {
    await conn.close();
  });

  it("should call channel's consume and cancel methods", async (done) => {
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
      on: () => false,
      listenerCount: () => 0
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
    done();
  }, 2000);
});
