const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { stripIndent } = require('common-tags');
const emojis = require('../../utils/emojis.js');

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

	run(interaction) {
		const members = interaction.guild.members.cache.array();
		const online = members.filter((m) => m.presence.status === 'online').length;
		const offline = members.filter((m) => m.presence.status === 'offline').length;
		const dnd = members.filter((m) => m.presence.status === 'dnd').length;
		const afk = members.filter((m) => m.presence.status === 'idle').length;

		const embed = new SignalEmbed(interaction)
			.setTitle(`Member Status [${interaction.guild.members.cache.size}]`)
			.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
			.setDescription(stripIndent`
				${emojis.online} **Online:** \`${online}\` members
				${emojis.idle} **Idle:** \`${afk}\` members
				${emojis.dnd} **Busy:** \`${dnd}\` members
				${emojis.offline} **Offline:** \`${offline}\` members
		  		`);
		return interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};