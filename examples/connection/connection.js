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

	const channel = await connection.createChannel(async (ch) => {
		// do whatever channel setup you want before you return it
		await ch.assertQueue("first-queue", { durable: false });
	});

	// now there already exists the asserted queue and wi can rely on it
	await channel.sendToQueue("first-queue", new Buffer("Check your rabbit mq instance for this message"));

	// You can create as many channels as you need
	const anotherChannel = await connection.createChannel(async (ch) => {
		// do whatever channel setup you want before you return it
	});

	// or we can asser queue here if we do not want to do it in prepare function
	await channel.assertQueue("second-queue", { durable: false });

	await anotherChannel.prefetch(1);
	await anotherChannel.consume("second-queue", (msg) => {
		console.log(msg.content.toString());
		channel.ack(msg);
	});
}

run();
