import { Connection } from "@src/Connection";
import { Publisher } from "@src/Publisher";
import { rabbitMQOptions } from "../config";

const conn = new Connection(rabbitMQOptions);

describe("Publisher", () => {
  it("should publish message", async () => {
    const channelMock: any = {
      publish: (
        exchange: string,
        routKey: string,
        content: Buffer,
        options: {}
      ) => {
        expect(exchange).toBe("some-ex");
        expect(routKey).toBe("rk");
        expect(content.toString()).toBe("test");
        expect(options).toEqual({
          contentType: "text/plain",
          headers: { foo: "bar" }
        });

        return true;
      },
      on: () => false
    };
    conn.createChannel = async () => channelMock;
    const publisher = new Publisher(conn, () => Promise.resolve());

    await publisher.publish("some-ex", "rk", Buffer.from("test"), {
      contentType: "text/plain",
      headers: { foo: "bar" }
    });

    // nothing should have been buffered
    expect(publisher.cleanBuffer()).toBe(0);
  });

  it("should send message to queue", async () => {
    const channelMock: any = {
      publish: (
        exchange: string,
        routKey: string,
        content: Buffer,
        options: {}
      ) => {
        expect(exchange).toBe("");
        expect(routKey).toBe("queue-name");
        expect(content.toString()).toBe("test");
        expect(options).toEqual({
          contentType: "text/plain",
          headers: { foo: "bar" }
        });

        return true;
      },
      on: () => false
    };
    conn.createChannel = async () => channelMock;
    const publisher = new Publisher(conn, () => Promise.resolve());

    await publisher.sendToQueue("queue-name", Buffer.from("test"), {
      contentType: "text/plain",
      headers: { foo: "bar" }
    });

    // nothing should have been buffered
    expect(publisher.cleanBuffer()).toBe(0);
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
      on: () => false
    };
    conn.createChannel = async () => channelMock;

    const publisher = new Publisher(conn, () => Promise.resolve());
    expect(publisher.cleanBuffer()).toBe(0);

    await Promise.all([
      publisher.publish("exname", "routkey", Buffer.from("content1"), {}),
      publisher.sendToQueue("queue", Buffer.from("content2"), {}),
      publisher.publish("exname", "routkey", Buffer.from("content3"), {})
    ]);

    expect(publisher.cleanBuffer()).toBe(3);
    expect(publisher.cleanBuffer()).toBe(0);
  });
});
