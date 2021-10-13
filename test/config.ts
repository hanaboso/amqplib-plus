import { IConnectionOptions } from "@src/Connection";

export const rabbitMQOptions: IConnectionOptions = {
  host: process.env.RABBITMQ_HOST || "localhost",
  port: parseInt(process.env.RABBITMQ_PORT || "5672", 10),
  user: process.env.RABBITMQ_USER || "guest",
  pass: process.env.RABBITMQ_PASS || "guest",
  vhost: process.env.RABBITMQ_VHOST || "/",
  heartbeat: 60
};
