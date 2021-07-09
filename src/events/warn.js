class Warn {
	constructor(client) {
		this.client = client;
	}

	run(args) {
		this.client.logger.warn(args[0]);
	}
}

module.exports = Warn;