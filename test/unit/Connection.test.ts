import { Connection } from "@src/Connection";

describe("Connection", () => {
  it("should accept connection string", async () => {
    const conn = new Connection({
      connectionString: "amqp://rabbit:5672/root"
    });
    expect(conn.getConnectionString()).toEqual("amqp://rabbit:5672/root");
    conn.close();
  });

  it("should accept connection options", async () => {
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
  });

  it("should prefer connection string over options options", async () => {
    const conn = new Connection({
      host: "rabbit",
      port: 5672,
      connectionString: "amqp://rabbit:5672/root"
    });
    expect(conn.getConnectionString()).toEqual("amqp://rabbit:5672/root");
    conn.close();
  });

  it("should accept ssl options to connect", async () => {
    const opts = {
      cert: 'cert.pem',
      key: 'key.pem',
      passphrase: '123',
      ca: 'ca.pem'
    }
    const conn = new Connection({
      connectionString: "amqp://rabbit:5672/root",
      ssl: opts
    });

    expect(conn.getSSLOptions()).toBeDefined();
    conn.close();
  });
});
