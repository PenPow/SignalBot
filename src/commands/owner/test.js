const Command = require('../Command.js');

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'test',
			usage: 'test',
			description: 'Test Command',
			type: client.types.OWNER,
			ownerOnly: true,
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['789215359878168586'],
		});
	}
	run(message) {
		const redisClient = this.client.redis;

		try {
			const redisKey = 'mute-test';
			redisClient.set(redisKey, 'true', 'EX', '5');
		}
		catch(e) {
			this.client.logger.error(e.stack);
		}

		message.reply('i got u bruv');
	}
};