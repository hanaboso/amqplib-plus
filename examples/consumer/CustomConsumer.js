const Consumer = require("./../../dist/lib/Consumer");

class CustomConsumer extends Consumer {

	constructor(conn, prepareFn) {
		super(conn, prepareFn);
	}

	processMessage(msg, channel) {
		// Your own messages process logic
		console.log("Message headers:", JSON.stringify(msg.properties.headers));
		console.log("Message body:", msg.body.toString());

		// Your own condition to decide whether to ack/nack/reject
		if (msg.body.toString().length > 10) {
			return channel.nack(msg);
		}

		channel.ack(msg);
	}

}

module.exports = CustomConsumer;