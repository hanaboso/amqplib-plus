import { Connection } from "@src/Connection";

import { assert } from "chai";
import "mocha";

describe("Connection", () => {
  it("should accept connection string", async () => {
    const conn = new Connection({
      connectionString: "amqp://rabbit:5672/root"
    });
    assert.equal(conn.getConnectionString(), "amqp://rabbit:5672/root");
  });

  it("should accept connection options", async () => {
    const conn = new Connection({
      host: "rabbit",
      port: 5672,
      pass: "guest",
      user: "guest"
    });
    assert.equal(
      conn.getConnectionString(),
      "amqp://guest:guest@rabbit:5672/?heartbeat=60"
    );
  });

  it("should prefer connection string over options options", async () => {
    const conn = new Connection({
      host: "rabbit",
      port: 5672,
      connectionString: "amqp://rabbit:5672/root"
    });
    assert.equal(conn.getConnectionString(), "amqp://rabbit:5672/root");
  });
});
