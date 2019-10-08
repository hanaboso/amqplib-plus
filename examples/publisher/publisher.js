const amqpPlus = require("amqplib-plus");

const options = {
	host: "localhost",
	port: 5672,
	user: "guest",
	pass: "guest",
	vhost: "/",
	heartbeat: 60,
};

const connection = new amqpPlus.Connection(options);

async function run() {
	await connection.connect();

	// Method to be called before instance is created and after every connection auto-reconnect
	const preparePublisher = async (ch) => {
		await ch.assertQueue("target-queue", { durable: false });
		await ch.assertExchange("target-exchange", "direct");
		await ch.bindQueue("target-queue", "target-exchange", "routKey");
		console.log("Publisher ready");
	};

	// Creates the instance
	const publisher = new amqpPlus.Publisher(connection, preparePublisher);

	// Send messages to message broker
	await publisher.sendToQueue("target-queue", new Buffer("message content"), {});
	await publisher.publish("target-exchange", "routKey", new Buffer("another content"), {});
	console.log("Two messages sent.");
}

run();