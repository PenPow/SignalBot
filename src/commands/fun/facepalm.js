const Command = require('../../structures/Command');
const { MessageAttachment } = require('discord.js');

module.exports = class FacepalmCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'facepalm',
			usage: 'facepalm',
			description: '*facepalm*',
			type: client.types.FUN,
			examples: ['facepalm'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction) {
		interaction.reply({ files: [new MessageAttachment('https://ss.penpow.dev/i/UCGFnx.jpg')] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};