# Consumer

Consumer's main task is to process incoming messages by given function.

See the [consumer.js](consumer.js) script to understand how to use it.

## Consumer class

Is an abstract class, from which you should derive your own consumers.
Similarly as when creating publisher, you must pass Connection instance and a prepare function to constructor.
Prepare function is called whenever the new instance is created and when auto-reconnect is done.

On every connection auto-reconnect the prepare function of consumer is called, then the consume function is called too, so you do not have to bother with manual consumption regeneration after failures. 

## Simple Consumer

Is concrete implementation of Constructor class.
Simple consumer automatically passes all received messages to given function and then acks them.
Simple consumer simplifies the COnsumer maximally. You just process the message itself and you do not have to bother with acking it via Channel.

## Custom Consumer
You can extend basic Consumer class to create your own consumer classes.
You can see the example of custom consumer is in [CustomConsumer.js](CustomConsumer.js).

Every custom consumer must implement processMessage(msg, channel) function.
In this function you can do whatever you want with the message and ack/nack/reject it via channel as you wish.

## Example

Run : `$ node consumer.js`

In output log you should see lines _(your consumption tags will differ)_:
```
Started consuming queue "source-simple-queue". Consumption tag: amq.ctag-8LSFBz973CA2DT-U1xToDA
Started consuming queue "source-custom-queue". Consumption tag: amq.ctag-h4c16EBm76NxHFA7ti7bTQ
```

You can publish any message to _source-simple-queue_ or _source-custom-queue_ and it will be process by SimpleConsumer or CustomConsumer.



