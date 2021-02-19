import { Connection } from "@src/Connection";
import fs from 'fs';
import path from 'path';

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
