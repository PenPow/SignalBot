const Command = require('../../structures/Command');

module.exports = class FacepalmCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'facepalm',
			usage: 'facepalm',
			description: '*facepalm*',
			type: client.types.MISC,
			examples: ['facepalm'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async run(interaction) {
		interaction.reply({ content: 'https://ss.penpow.dev/i/UCGFnx.jpg' });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};