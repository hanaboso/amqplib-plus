"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitMQOptions = {
    host: process.env.RABBITMQ_HOST || "localhost",
    port: parseInt(process.env.RABBITMQ_PORT, 10) || 5672,
    user: process.env.RABBITMQ_USER || "guest",
    pass: process.env.RABBITMQ_PASS || "guest",
    vhost: process.env.RABBITMQ_VHOST || "/",
    heartbeat: 60,
};
//# sourceMappingURL=config.js.map