class Error {
	constructor(client) {
		this.client = client;
	}

	run(args) {
		this.client.logger.error(args[0]);
	}
}

module.exports = Error;