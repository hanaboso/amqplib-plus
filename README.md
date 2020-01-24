# Amqplib-plus

Amqplib-plus amplifies the original npm [amqplib library](https://www.npmjs.com/package/amqplib) with OOP approach.

Amqplib-plus adds following features:
- connection auto-reconnect
- easy to use object oriented publisher
- easy to use object oriented consumer that runs user defined callback for every consumed message

## How to install:
`$ npm install amqplib-plus`

## How to use

### Basic example - publish and consume

```typescript
import {Connection, Consumer, Publisher} from "amqplib-plus";
import {Channel, Message} from "amqplib";
import {CustomConsumer} from "./CustomConsumer"; // CustomConsumer is your own consumer implementation that extends amqplib-plus Consumer 

const queue = { name: "some_queue_name", options: {} };
const msgContent = "some content";

// callback to be called when creating the consumer, before it starts consuming
// consumer wants to be sure the queue exists
const consumerPrepare: any = (ch: Channel) => {
    return ch.assertQueue(queue.name, queue.options);
};

// the callback to be called on every consumed message
// you process the message as you like and tken ack/reject it as you wish
const handleMsg = (msg: Message, ch: Channel) => {
    console.log(msg.content.toString());
    ch.ack(msg);
};

// creates the connection to rabbitmq broker
const amqpConn = new Connection(
    { connectionString: 'amqp://guest:guest@localhost:5672/' },
    console // you may use custom logger or avoid it to disable logging
);

// create the consumer using existing connection and start the consumption
const consumer = new CustomConsumer(conn, consumerPrepare, handleMsg);
consumer.consume(queue.name, {});


// callback to be called when creating the publisher before it starts publishing
// publisher wants to be sure the publishing queue exists
const publisherPrepare: any = (ch: Channel) => {
    return ch.assertQueue(queue.name, queue.options);
};
// create the publisher using the existing connection
const publisher = new Publisher(conn, publisherPrepare);
// send a message that consumer should consume
publisher.sendToQueue(queue.name, Buffer.from(msgContent), {});
```

### More examples and tutorials

[Connection](examples/connection/README.md)

[Publisher](examples/publisher/README.md)

[Consumer](examples/consumer/README.md)

## How to contribute:

Create pull request to `https://github.com/hanaboso/amqplib-plus` repository.
Please note that this lib is written in typescript. Your contribution is very welcome.

## How to run the tests
If you have running rabbitmq instance, set env variable values defined used in test/config.ts (default rabbitmq dsn is 'amqp://guest:guest@localhost:5672/') and run: `npm run test`.

Or you can use custom rabbitmq instance in test by running `RABBIT_DSN=amqp://guest:guest@yourserver:5672/ npm run test`

Alternatively you can run: `make test` which will start rabbitmq instance for you and run tests in docker-compose.
