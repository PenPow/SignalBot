const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const fetch = require('node-fetch');

module.exports = class DogFactCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dogfact',
			usage: 'dogfact',
			// aliases: ['catpic'],
			description: 'Finds a random dog fact',
			type: client.types.FUN,
			examples: ['dogfact'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message) {
		try {
			const res = await fetch('https://dog-api.kinduff.com/api/facts');
			const fact = (await res.json()).facts[0];

			const embed = new SignalEmbed(message)
				.setTitle(`${fun} Dog Fact 🐕`)
				.setDescription(fact);

			message.reply({ embeds: [embed] });
		}
		catch(err) {
			message.client.logger.error(err.stack);
			this.sendErrorMessage(message, 1, 'Please try again in a few seconds', err.message);
		}
	}

	async slashRun(interaction) {
		try {
			const res = await fetch('https://dog-api.kinduff.com/api/facts');
			const fact = (await res.json()).facts[0];

			const embed = new SignalEmbed(interaction)
				.setTitle(`${fun} Dog Fact 🐕`)
				.setDescription(fact);

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