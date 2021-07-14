const Command = require('../../structures/Command');

module.exports = class DeployCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'deploy',
			usage: 'deploy',
			description: 'Deploys slash commands to the global CDN',
			type: client.types.OWNER,
			ownerOnly: true,
			examples: [
				'deploy',
			],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['789215359878168586'],
		});
	}
	async run(message) {
		this.client.logger.info('Loading Slash Commands...');

		const commandArray = [];

		this.client.commands.each(async command => {
			if(command.disabled) return;
			if(command.ownerOnly || command.type === this.client.types.OWNER) return;

			commandArray.push(command.generateSlashCommand());
		});

		const test_guild = await this.client.guilds.fetch('789215359878168586');
		test_guild.commands.set(commandArray);

		message.reply('✅');
	}
};