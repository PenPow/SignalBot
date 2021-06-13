const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class ServerIconCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'servericon',
			usage: 'servericon',
			aliases: ['icon', 'i'],
			description: 'Displays the server\'s icon.',
			type: client.types.INFO,
			examples: ['servericon', 'icon', 'i'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message) {
		const embed = new MessageEmbed()
			.setTitle(`${message.guild.name}'s Icon`)
			.setImage(message.guild.iconURL({ dynamic: true, size: 512 }))
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);
		message.reply({ embeds: [embed] });
	}

	slashRun(interaction) {
		const embed = new MessageEmbed()
			.setTitle(`${interaction.guild.name}'s Icon`)
			.setImage(interaction.guild.iconURL({ dynamic: true, size: 512 }))
			.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);
		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};