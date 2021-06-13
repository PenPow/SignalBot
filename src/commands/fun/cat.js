const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

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

			const embed = new MessageEmbed()
				.setTitle(`${fun} Meow! 🐈`)
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
		const apiKey = interaction.client.apiKeys.catApi.token;
		try {
			const res = await fetch('https://api.thecatapi.com/v1/images/search', { headers: { 'x-api-key': apiKey } });
			const img = (await res.json())[0].url;

			const embed = new MessageEmbed()
				.setTitle(`${fun} Meow! 🐈`)
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