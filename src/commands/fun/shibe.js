const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const fetch = require('node-fetch');

module.exports = class ShibeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'shibe',
			usage: 'shibe',
			description: 'Shibe pictures',
			type: client.types.FUN,
			examples: ['shibe'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async run(interaction) {
		try {
			const res = await fetch('http://shibe.online/api/shibes');
			const img = (await res.json())[0];

			const embed = new SignalEmbed(interaction)
				.setTitle(`${fun} Woof! 🐕`)
				.setImage(img);

			interaction.reply({ ephemeral: true, embeds: [embed] });
		}
		catch(err) {
			interaction.client.logger.error(err.stack);
			this.sendErrorMessage(interaction, 1, 'Please try again in a few seconds', err.message);
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};