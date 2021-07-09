class Debug {
	constructor(client) {
		this.client = client;
	}

	async run(args) {
		this.client.logger.debug(args[0]);
	}
}

module.exports = Debug;