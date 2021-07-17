const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const fetch = require('node-fetch');

module.exports = class CatCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'cat',
			usage: 'cat',
			aliases: ['catpic', 'kitten', 'kittenpic'],
			description: 'Finds a random cat to watch',
			type: client.types.FUN,
			examples: ['cat', 'catpic', 'kitten', 'kittenpic'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message) {
		const apiKey = message.client.apiKeys.catApi.token;
		try {
			const res = await fetch('https://api.thecatapi.com/v1/images/search', { headers: { 'x-api-key': apiKey } });
			const img = (await res.json())[0].url;

			const embed = new SignalEmbed(message)
				.setTitle(`${fun} Meow! 🐈`)
				.setImage(img);

			message.reply({ embeds: [embed] });
		}
		catch(err) {
			message.client.logger.error(err.stack);
			this.sendErrorMessage(message, 1, 'Please try again in a few seconds', err.message);
		}
	}

	async slashRun(interaction) {
		const apiKey = interaction.client.apiKeys.catApi.token;
		try {
			const res = await fetch('https://api.thecatapi.com/v1/images/search', { headers: { 'x-api-key': apiKey } });
			const img = (await res.json())[0].url;

			const embed = new SignalEmbed(interaction)
				.setTitle(`${fun} Meow! 🐈`)
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