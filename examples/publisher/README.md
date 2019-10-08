# Publisher

Publisher's goal is to send message from your app to RabbitMQ message broker.

See the [publisher.js](publisher.js) script to understand how to use it.

## Public interface

Publisher provides you with following 2 methods
 - publish
 - sendToQueue
 
They behave exactly the same as publish and sendToQueue methods of amqplib:
 - publish http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish
 - sendToQueue http://www.squaremobius.net/amqp.node/channel_api.html#channel_sendToQueue

## Drain event

Sometimes messages cannot be published to Broker due to full write buffer etc.
Publisher class contains logic for buffering these messages and re-publishing them when available by hooking on amqplib drain event. 

## Prepare Publisher function
Second parameter when creating Publisher instance is the prepare function.
This function is called when creating the instance and then every time when connection is recreated due to auto-reconnect.
If you assert queues, exchanges etc in this function, you can be sure these will be asserted after reconnection on actual channel. 

## Example

Run : `$ node publisher.js`

Two messages will appear in management console in "target-queue" queue.
The first sent via _sendToQueue_ method and the second sent via _publish_ method.

## Assertion publisher
Assertion publisher is specific implementation of Publisher, that is able to publish any queue and you don't have to be worried if the the queue exists or not, because it asserts it before every publish.
Use AssertionPublisher wisely, because asserts slows down the whole process! 