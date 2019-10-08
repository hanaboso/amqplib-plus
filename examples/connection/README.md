# Connection

Connection class is your gateway to RabbitMQ world.

See the [connection.js](connection.js) script to understand how to use it.

At first we must provide connection options to our running RabbitMQ instance (host, port, ...).
Once we have this done, we create the Connection instance.
If you follow the attached code, you will see that after connection is created, it provides us with two methods:
 - connect <Promise < Connection >>
 - createChannel: <Promise < Channel > >
 
The Channel is the original Channel object from amqplib (http://www.squaremobius.net/amqp.node/channel_api.html#channel), and can be used as you wish.

## Example
`node connection.js`

By running this script, you should see the "Connected to RabbitMq" log in your console.

You can open your RabbitMQ Management console and check that there exist two queues created by running code, and there is a message in one "first-queue", that we published to it previously.
You can manually publish some message to "second-queue" and it's content will be logged to console.

## Auto-reconnect
The most interesting part of the Connection class is auto-reconnect.

In an ideal world the connection would be permanent, but in our programmers world servers and connection fall down often.
Amqplib-plus gives you the ability to re-establish new connection if the previous one dies.

Just run the code once again and then stop/kill your rabbitmq instance and start/run ti again.
You will be able to use the same connection instance, but the real underlining connection to rabbitmq has been recreated. 

Run the app:

````$ node connection.js````

Restart rabbitmq:
```
$ rabitmqctl restart
// or if ou use docker: $ docker restart myrabbitmq
```

App will be still running and in log you will see something similar to this:
```
Connected to RabbitMQ.
AMQP Connection error Unexpected close
AMQP Connection closed Unexpected close
RabbitMQ connection failed. Reason: Socket closed abruptly during opening handshake
RabbitMQ connection failed. Reason: Socket closed abruptly during opening handshake
Connected to RabbitMQ.
```

The app connected to RabbitMQ, then connection died, so it tried automatically to reconnect for few times in predefined intervals and
once the RabbitMQ is ready, it connected to it again.

**Note:** 
_After the reconnect our queues created by the script have disappeared (durability was set to false).
This is perfectly valid state and we must keep this on mind. Luckily there exist Publisher and Consumer classes which will help us.
See publisher and consumer examples to find out more._ 
 