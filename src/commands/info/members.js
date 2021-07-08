const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const emojis = require('../../utils/emojis.js');
const { stripIndent } = require('common-tags');

module.exports = class MembersCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'members',
			usage: 'members',
			aliases: ['memberstatus'],
			description: 'Displays how many server members are online, busy, AFK, and offline.',
			type: client.types.INFO,
			examples: ['members', 'memberstatus'],
			clientPermissions: ['EMBED_LINKS'],
			//   userPermissions: ['CHANGE_NICKNAME'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message) {
		const members = message.guild.members.cache.array();
		const online = members.filter((m) => m.presence.status === 'online').length;
		const offline = members.filter((m) => m.presence.status === 'offline').length;
		const dnd = members.filter((m) => m.presence.status === 'dnd').length;
		const afk = members.filter((m) => m.presence.status === 'idle').length;

		const embed = new MessageEmbed()
			.setTitle(`Member Status [${message.guild.members.cache.size}]`)
			.setThumbnail(message.guild.iconURL({ dynamic: true }))
			.setDescription(stripIndent`
      			  ${emojis.online} **Online:** \`${online}\` members
      			  ${emojis.idle} **Idle:** \`${afk}\` members
				  ${emojis.dnd} **Busy:** \`${dnd}\` members
      			  ${emojis.offline} **Offline:** \`${offline}\` members
      			`)
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);
		return message.reply({ embeds: [embed] });
	}

	slashRun(interaction) {
		const members = interaction.guild.members.cache.array();
		const online = members.filter((m) => m.presence.status === 'online').length;
		const offline = members.filter((m) => m.presence.status === 'offline').length;
		const dnd = members.filter((m) => m.presence.status === 'dnd').length;
		const afk = members.filter((m) => m.presence.status === 'idle').length;

		const embed = new MessageEmbed()
			.setTitle(`Member Status [${interaction.guild.members.cache.size}]`)
			.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
			.setDescription(stripIndent`
				${emojis.online} **Online:** \`${online}\` members
				${emojis.idle} **Idle:** \`${afk}\` members
				${emojis.dnd} **Busy:** \`${dnd}\` members
				${emojis.offline} **Offline:** \`${offline}\` members
		  		`)
			.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);
		return interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};