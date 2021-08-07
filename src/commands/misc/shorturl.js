const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { misc } = require('../../utils/emojis.js');

const fetch = require('node-fetch');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class ShortURLCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'shorturl',
			usage: 'shorturl <URL>',
			description: 'Shortens a URL down to a smaller one!',
			type: client.types.MISC,
			examples: ['shorturl www.google.com'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction, args) {
		try {
			const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURI(args.get('url')?.value)}`);
			const body = await res.text();

			if(body === 'Error: Please enter a valid URL to shorten') {
				return this.sendErrorMessage(interaction, 0, 'Please provide a valid URL');
			}

			const embed = new SignalEmbed(interaction)
				.setTitle(`${misc} Shortened URL Successfully 🔗`)
				.setDescription(body);

			interaction.reply({ embeds: [embed], ephemeral: true });
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
			options: [{
				name: 'url',
				type: ApplicationCommandOptionType.String,
				description: 'URL to shorten',
				required: true,
			}],
		};
	}
};