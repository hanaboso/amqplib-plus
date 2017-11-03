const Connection = require("./../../dist/lib/Connection");
const CustomConsumer = require("./CustomConsumer");
const SimpleConsumer = require("./../../dist/lib/SimpleConsumer");

const options = {
	host: "localhost",
	port: 5672,
	user: "guest",
	pass: "guest",
	vhost: "/",
	heartbeat: 60,
};

const connection = new Connection(options);

/*
 *
 * Using predefined Simple consumer example
 *
 */

async function runSimpleConsumer() {
	await connection.connect();

	// Method to be called before instance is created and after every connection auto-reconnect
	// You should at least assert the queue you want to consume here
	const prepareConsumer = async (ch) => {
		await ch.assertQueue("source-simple-queue", { durable: false });
		await ch.prefetch(10);
	};

	// Define what to do with every received message
	// Every message is automatically acked by SimpleConsumer
	const processDataSimply = (msg) => {
		// Do whatever you want with the message
		console.log("Message headers:", JSON.stringify(msg.properties.headers));
		console.log("Message body:", msg.body.toString());
	};

	const simpleConsumer = new SimpleConsumer(connection, prepareConsumer, processDataSimply);
	simpleConsumer.consume("source-simple-queue", {});
}

runSimpleConsumer();

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
		await ch.assertQueue("source-custom-queue", { durable: false });
		await ch.prefetch(5);
	};

	const customConsumer = new CustomConsumer(connection, prepareConsumer);
	customConsumer.consume("source-custom-queue", {});
}

runCustomConsumer();
