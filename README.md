#amqplib-plus

Amqplib-plus amplifies the original npm [amqplib library](https://www.npmjs.com/package/amqplib) with OOP approach.

Amqplib-plus adds following features:
- connection auto-reconnect
- easy to use object oriented publisher
- easy to use object oriented consumer that runs user defined function on every consumed message

## How to install:
`$ npm install amqplib-plus`

## Examples and tutorials
[Connection](examples/connection/README.md)

[Publisher](examples/publisher/README.md)

[Consumer](examples/consumer/README.md)

## How to use

### Usage in pure ES6
Import the Class you want to use (Connection, Publisher, Consumer) from **dist/** folder

Note: _If there is no ./dist folder present, run `$ npm run build` to generate it for local development._

### Usage in pure Typescript
Import the Class you want to use (Connection, Publisher, Consumer) from **src/** folder.

This library already contain .d.ts files and you can easily integrate it also with your typescript projects.


## How to contribute:

Create pull request to `https://github.com/hanaboso/amqplib-plus` repository.
Please note that this lib is written in typescript. Your contribution is very welcome.

## How run to tests
If you have running rabbitmq instance, set env variable values defined used in test/config.ts and run: `$ npm test`.

Alternatively you can run: `$ make test` which will start rabbitmq instance for you and run tests in docker-compose.