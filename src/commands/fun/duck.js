const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const fetch = require('node-fetch');

module.exports = class DuckCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'duck',
			usage: 'duck',
			aliases: ['duckpic'],
			description: 'Finds a random duck to watch',
			type: client.types.FUN,
			examples: ['duck', 'duckpic'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async run(interaction) {
		try {
			const res = await fetch('https://random-d.uk/api/v2/random');
			const img = (await res.json()).url;

			const embed = new SignalEmbed(interaction)
				.setTitle(`${fun} Quack! 🦆`)
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