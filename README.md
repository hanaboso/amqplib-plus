#amqplib-plus

Amqplib-plus enhances the original npm amqplib library (https://www.npmjs.com/package/amqplib).

Amqplib-plus adds following features:
- amqp connection, publisher and consumer object oriented classes
- connection auto-reconnect
- easy to use publisher that auto-reconnects
- easy to use consumer that runs user defined function on every consumed message and starts consumption again after auto-reconnect.

## How to use

Import dependencies:
```ecmascript
import {Channel, Options, Message} from "amqplib";
import Connection from "amqplib-plus/Connection";
import Publisher from "amqplib-plus/Publisher";
import SimpleConsumer from "amqplib-plus/SimpleConsumer";
```

Set connection details and what to do before any message is published via this publisher instance
```ecmascript
const conn = new Connection({
    host: "localhost",
    port: 5672,
    user: "guest",
    pass: "guest",
    vhost: "/",
    heartbeat: 60,
});

const prepare = async (ch: Channel) => {
    // set up your queues, exchanges etc. here
    await ch.assertQueue("queueName", {});
    await ch.assertExchange("exName", "direct", {});
    await ch.bindQueue("queueName", "exName", "rk");
    // ...
}
```

### Publisher

Create new publisher instance and publish message
```ecmascript
const publisher = new Publisher(conn, prepare);
publisher.publish("exName", "rk", new Buffer("test"), {});
```

### Simple Consumer

Create new consumer instance and start consumption.

Simple consumer calls process method and then always acks the message.

If you need further logic for ack/nack/reject you must implement custom consumer that ingerits basic Consumer class like SimpleConsumer does.  
```ecmascript

const process = (msg: Message) => {
    // do whatever you want with the message
    console.log(msg);
};

const consumer = new SimpleConsumer(conn, prepare, process);
consumer.consume("queueName", {});
```

## How to test
If you have running rabbitmq instance, set env variable values defined used in test/config.ts and run: `$ npm test`.

Alternatively you can run: `$ make test` which will start rabbitmq instance for you and run tests in dockerized containers.