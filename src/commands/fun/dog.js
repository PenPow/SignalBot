const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const fetch = require('node-fetch');

module.exports = class DogCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dog',
			usage: 'dog',
			aliases: ['puppy', 'puppypic', 'pup', 'puppic'],
			description: 'Finds a random dog to watch',
			type: client.types.FUN,
			examples: ['dog', 'puppy', 'pup', 'puppic'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async slashRun(interaction) {
		try {
			const res = await fetch('https://dog.ceo/api/breeds/image/random');
			const img = (await res.json()).message;

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