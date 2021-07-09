class RateLimit {
	constructor(client) {
		this.client = client;
	}

	run(args) {
		this.client.logger.warn(`Ratelimit Hit (${this.client.utils.millisToMinutesAndSeconds(args[0].timeout)}) on Route ${args[0].route}\n${args[0].path}`);
	}
}

module.exports = RateLimit;