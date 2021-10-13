import { Connection } from "@src/Connection";

describe("Connection", () => {
  let conn: Connection;

  afterEach( () => {
    conn.close();
  })

  it("should accept connection string", () => {
     conn = new Connection({
      connectionString: "amqp://rabbitmq:5672"
    });
    expect(conn.getConnectionString()).toEqual("amqp://rabbitmq:5672");
  });

  it("should accept connection options",  () => {
    conn = new Connection({
      host: "rabbitmq",
      port: 5672,
      pass: "guest",
      user: "guest"
    });
    expect(conn.getConnectionString()).toEqual(
      "amqp://guest:guest@rabbitmq:5672/?heartbeat=60"
    );
  });

  it("should prefer connection string over options options",  () => {
    conn = new Connection({
      host: "rabbitmq",
      port: 5672,
      connectionString: "amqp://rabbitmq:5672/root"
    });
    expect(conn.getConnectionString()).toEqual("amqp://rabbitmq:5672/root");
  });

  it("should accept ssl options to connect",  () => {
    const mockFile = "123";

    const opts = {
      cert: Buffer.from(mockFile),
      key: Buffer.from(mockFile),
      passphrase: '123',
      ca: Buffer.from(mockFile)
    }
    conn = new Connection({
      connectionString: "amqp://rabbitmq:5671",
      ssl: opts
    });

    expect(conn.getSSLOptions()).toBeDefined();
  });
});
