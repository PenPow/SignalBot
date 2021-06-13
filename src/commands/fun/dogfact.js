const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

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

			const embed = new MessageEmbed()
				.setTitle(`${fun} Dog Fact 🐕`)
				.setDescription(fact)
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
			const res = await fetch('https://dog-api.kinduff.com/api/facts');
			const fact = (await res.json()).facts[0];

			const embed = new MessageEmbed()
				.setTitle(`${fun} Dog Fact 🐕`)
				.setDescription(fact)
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

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};