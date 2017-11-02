#amqplib-plus

Amqplib-plus amplifies the original npm amqplib library (https://www.npmjs.com/package/amqplib) with OOP approach.
Contains d.ts files to be easily used in your typescript code.

Amqplib-plus adds following features:
- amqp connection, publisher and consumer object oriented classes
- connection auto-reconnect
- easy to use publisher
- easy to use consumer that runs user defined function on every consumed message

## How to install:
`$ npm install amqplib-plus`

## Basic classes to be used in your code:
 - Connection:
    - amqplib-plus/dist/lib/Connection
    - wraps connection to rabbitmq instance and auto-reconnecting
    - Connection instance to be passed to Publisher, Consumer
 - Publisher:
    - amqplib-plus/dist/lib/Publisher
    - wraps logic for publishing messages to broker (publish and sedToQueue methods can be used)
    - params:
        - connection instance
        - prepare function for queues/exchanges/binds etc. creation using channel which is called righ after publisher instance creation
 - AssertPublisher:
    - amqplib-plus/dist/lib/AssertPublisher
    - extends Publisher and asserts queue before every publish/sendToQueue
    - params:
        - connection instance
        - prepare function for queues/exchanges/binds etc. creation using channel which is called righ after publisher instance creation
        - params for new queues assertion
 - Consumer:
    - amqplib-plus/dist/lib/Consumer
    - abstract class for your custom consumer classes to be built on
 - SimpleConsumer:
    - amqplib-plus/dist/lib/SimpleConsumer
    - basic example consumer implementation that calls process function for every received messages and acks it afterwards
    - params:
        - connection instance
        - prepare function for queues/exchanges/binds etc. creation using channel which is called righ after publisher instance creation
        - process message function
    

## How to use (Typescript)

Import dependencies (Typescript):
```typescript
import {Channel, Message} from "amqplib";
import Connection from "amqplib-plus/dist/lib/Connection";
import Publisher from "amqplib-plus/dist/lib/Publisher";
import SimpleConsumer from "amqplib-plus/dist/lib/SimpleConsumer";

// Set connection details
const conn = new Connection({
    host: "localhost",
    port: 5672,
    user: "guest",
    pass: "guest",
    vhost: "/",
    heartbeat: 60,
});

// Create queues, exchanges and whatever else you want to have prepared before first publish 
const prePublish = async (ch: Channel) => {
    // set up your queues, exchanges etc. here
    await ch.assertQueue("queueName", {});
    await ch.assertExchange("exName", "direct", {});
    await ch.bindQueue("queueName", "exName", "rk");
    // ...
}

// Creates new publisher instance and publish message using it
const publisher = new Publisher(conn, prePublish);
publisher.publish("exName", "rk", new Buffer("test"), {});

// Create new consumer instance and start consumption from queue
// Simple consumer calls process method  on every received message and then always acks the message.
// If you need further logic for ack/nack/reject you must implement custom consumer that inherits basic Consumer class like SimpleConsumer does.
const preConsume = async (ch: Channel) => {
    // set up your queues, exchanges etc. here
    await ch.assertQueue("queueName", {});
    // ...
};
const process = (msg: Message) => {
    // do whatever you want with the message
    console.log(msg);
};
const consumer = new SimpleConsumer(conn, preConsume, process);
consumer.consume("queueName", {});
```

## How to use (ES6,  Node 8 and above)
```ecmascript 6
const Connection  = require("amqplib-plus/dist/lib/Connection");
const Publisher = require("amqplib-plus/dist/lib/Publisher");
const SimpleConsumer = require("amqplib-plus/dist/lib/SimpleConsumer");

const conn = new Connection.default({
    host: "localhost",
    port: 5672,
    user: "guest",
    pass: "guest",
    vhost: "/",
    heartbeat: 60,
});

// Create queues, exchanges and whatever else you want to have prepared before first publish 
const prePublish = async (ch) => {
    // set up your queues, exchanges etc. here
    return ch.assertQueue("queueName", {});
    // ...
}

// Creates new publisher instance and publish message using it
const publisher = new Publisher.default(conn, prePublish);
publisher.sendToQueue("queueName", new Buffer("test"), {});

// Create new consumer instance and start consumption from queue
// Simple consumer calls process method  on every received message and then always acks the message.
// If you need further logic for ack/nack/reject you must implement custom consumer that inherits basic Consumer class like SimpleConsumer does.
const preConsume = async (ch) => {
    // set up your queues, exchanges etc. here
    return ch.assertQueue("queueName", {});
    // ...
};
const process = (msg) => {
    // do whatever you want with the message
    console.log(msg);
};
const consumer = new SimpleConsumer.default(conn, preConsume, process);
consumer.consume("queueName", {});
```

## How to contribute:

Create pull request to `https://github.com/hanaboso/amqplib-plus` repository.
Please note that this lib is written in typescript. 

## How to test
If you have running rabbitmq instance, set env variable values defined used in test/config.ts and run: `$ npm test`.

Alternatively you can run: `$ make test` which will start rabbitmq instance for you and run tests in docker containers.