export interface IPublisher {

    /**
     * Publishes message to the exchange
     *
     * @param {string} exchange
     * @param {string} routKey
     * @param {Buffer} content
     * @param {object} options
     *
     * @return {Promise}
     */
    publish(exchange: string, routKey: string, content: Buffer, options: {}): Promise<void>;

    /**
     * Publishes message directly to the queue
     *
     * @param {string} queue
     * @param {Buffer} content
     * @param {object} options
     *
     * @return {Promise}
     */
    sendToQueue(queue: string, content: Buffer, options: {}): Promise<void>;

}
