import { Connection } from "@src/Connection";

describe("Connection", () => {
  it("should accept connection string", async (done) => {
    const conn = new Connection({
      connectionString: "amqp://rabbit:5672/root"
    });
    expect(conn.getConnectionString()).toEqual("amqp://rabbit:5672/root");
    conn.close();
    done();
  }, 2000);

  it("should accept connection options", async (done) => {
    const conn = new Connection({
      host: "rabbit",
      port: 5672,
      pass: "guest",
      user: "guest"
    });
    expect(conn.getConnectionString()).toEqual(
      "amqp://guest:guest@rabbit:5672/?heartbeat=60"
    );
    conn.close();
    done();
  }, 2000);

  it("should prefer connection string over options options", async (done) => {
    const conn = new Connection({
      host: "rabbit",
      port: 5672,
      connectionString: "amqp://rabbit:5672/root"
    });
    expect(conn.getConnectionString()).toEqual("amqp://rabbit:5672/root");
    conn.close();
    done();
  }, 2000);

  it("should accept ssl options to connect", async () => {
    const mockFile = "123";

    const opts = {
      cert: Buffer.from(mockFile),
      key: Buffer.from(mockFile),
      passphrase: '123',
      ca: Buffer.from(mockFile)
    }
    const conn = new Connection({
      connectionString: "amqps://rabbit:5671",
      ssl: opts
    });

    expect(conn.getSSLOptions()).toBeDefined();
    conn.close();
  });
});
