const amqpPlus = require("amqplib-plus");
const CustomConsumer = require("./CustomConsumer");

const options = {
	host: "localhost",
	port: 5672,
	user: "guest",
	pass: "guest",
	vhost: "/",
	heartbeat: 60,
};

const connection = new amqpPlus.Connection(options, console);

/*
 *
 * Using Custom consumer example
 *
 */

async function runCustomConsumer() {
	await connection.connect();

	// Method to be called before instance is created and after every connection auto-reconnect
	// You should at least assert the queue you want to consume here
	const prepareConsumer = async (ch) => {
		await ch.assertQueue("my-queue", { durable: false });
		await ch.prefetch(5);
	};

	const customConsumer = new CustomConsumer(connection, prepareConsumer);
	await customConsumer.consume("my-queue", {});

	console.log("Started consuming 'my-queue'");
}

runCustomConsumer();