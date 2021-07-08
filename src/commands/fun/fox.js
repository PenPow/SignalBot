const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');

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

			const embed = new MessageEmbed()
				.setTitle(`${fun} Quack! 🦆`)
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
			const res = await fetch('https://randomfox.ca/floof/');
			const img = (await res.json()).image;

			const embed = new MessageEmbed()
				.setTitle(`${fun} Quack! 🦆`)
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

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};