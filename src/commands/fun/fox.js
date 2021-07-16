const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const fetch = require('node-fetch');

module.exports = class FoxCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fox',
			usage: 'fox',
			aliases: ['foxpic'],
			description: 'Finds a random fox to watch',
			type: client.types.FUN,
			examples: ['fox', 'foxpic'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message) {
		try {
			const res = await fetch('https://randomfox.ca/floof/');
			const img = (await res.json()).image;

			const embed = new SignalEmbed(message)
				.setTitle(`${fun} Quack! 🦆`)
				.setImage(img);

			message.reply({ embeds: [embed] });
		}
		catch(err) {
			message.client.logger.error(err.stack);
			this.sendErrorMessage(message, 1, 'Please try again in a few seconds', err.message);
		}
	}

	async slashRun(interaction) {
		try {
			const res = await fetch('https://randomfox.ca/floof/');
			const img = (await res.json()).image;

			const embed = new SignalEmbed(interaction)
				.setTitle(`${fun} Quack! 🦆`)
				.setImage(img);

			interaction.reply({ ephemeral: true, embeds: [embed] });
		}
		catch(err) {
			interaction.client.logger.error(err.stack);
			this.sendSlashErrorMessage(interaction, 1, 'Please try again in a few seconds', err.message);
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};