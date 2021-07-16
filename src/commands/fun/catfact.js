const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const fetch = require('node-fetch');

module.exports = class CatFactCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'catfact',
			usage: 'catfact',
			// aliases: ['catpic'],
			description: 'Finds a random cat fact',
			type: client.types.FUN,
			examples: ['catfact'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message) {
		try {
			const res = await fetch('https://catfact.ninja/fact');
			const fact = (await res.json()).fact;

			const embed = new SignalEmbed(message)
				.setTitle(`${fun} Cat Fact 🐈`)
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
			const res = await fetch('https://catfact.ninja/fact');
			const fact = (await res.json()).fact;

			const embed = new SignalEmbed(interaction)
				.setTitle(`${fun} Cat Fact 🐈`)
				.setDescription(fact);

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