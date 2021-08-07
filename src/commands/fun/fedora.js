const Command = require('../../structures/Command');
const { MessageAttachment } = require('discord.js');

module.exports = class TipsFedoraCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fedora',
			usage: 'fedora',
			description: '*Tips Fedora*',
			type: client.types.FUN,
			examples: ['tipsfedora', 'fedora'],
		});
	}

	async run(interaction) {
		interaction.reply({ files: [new MessageAttachment('https://i.kym-cdn.com/photos/images/masonry/000/747/485/3a1.gif')] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};