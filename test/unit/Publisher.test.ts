import { Connection } from "@src/Connection";
import { Publisher } from "@src/Publisher";
import { rabbitMQOptions } from "../config";

describe("Publisher", () => {
  let conn: Connection;

  beforeAll(() => {
    conn = new Connection(rabbitMQOptions);
  });

  afterAll(() => {
    conn.close();
  });

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
});
