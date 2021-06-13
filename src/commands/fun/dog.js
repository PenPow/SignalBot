const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

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
	async run(message) {
		try {
			const res = await fetch('https://dog.ceo/api/breeds/image/random');
			const img = (await res.json()).message;

			const embed = new MessageEmbed()
				.setTitle(`${fun} Woof! 🐕`)
				.setImage(img)
				.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
				.setColor(message.guild.me.displayHexColor);

			message.reply({ embeds: [embed] });
		}
		catch(err) {
			message.client.logger.error(err.stack);
			this.sendErrorMessage(message, 1, 'Please try again in a few seconds', err.message);
		}
	}

	async slashRun(interaction) {
		try {
			const res = await fetch('https://dog.ceo/api/breeds/image/random');
			const img = (await res.json()).message;

			const embed = new MessageEmbed()
				.setTitle(`${fun} Woof! 🐕`)
				.setImage(img)
				.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
				.setColor(interaction.guild.me.displayHexColor);

			interaction.reply({ ephemeral: true, embeds: [embed] });
		}
		catch(err) {
			interaction.client.logger.error(err.stack);
			this.sendSlashErrorMessage(interaction, 1, 'Please try again in a few seconds', err.message);
		}
	}
};