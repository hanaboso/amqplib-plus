const amqpPlus = require("amqplib-plus");
const fs = require('fs');

// For secure connection we MUST appoint the connection params with AMPQS insted of AMQP because AMQPS is the secure protocol to amqp.
// The port changes from 5672 to 5671
// You can see all details about SSL Connection here: https://www.rabbitmq.com/ssl.html
const options = {
	connectionString: 'amqps://guest:guest@localhost:5671/',
	heartbeat: 60,
	ssl: {
		cert: fs.readFileSync('cert.pem'),
		key: fs.readFileSync('key.pem'),			
		// Or you can appoint a PFX certificate instead of cert and key
		// pfx: fs.readFileSync('pfx.pem'),
		// And
		passphrase: 'its-a-test,',
		ca: fs.readFileSync('ca.pem'),
	}
};

// At this moment, if you pass the ssl params on options automatically the Connection below will try to connect using the certificates.
const connection = new amqpPlus.Connection(options);

async function run() {
	await connection.connect();

	const channel = await connection.createChannel(async (ch) => {
		// do whatever channel setup you want before you return it
		await ch.assertQueue("first-queue", { durable: false });
	});

	// now there already exists the asserted queue and wi can rely on it
	await channel.sendToQueue("first-queue", Buffer.from("Check your rabbit mq instance for this message"));

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
