const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { stripIndent } = require('common-tags');
const moment = require('moment');
const { owner, voice } = require('../../utils/emojis.js');

const verificationLevels = {
	NONE: '`None`',
	LOW: '`Low`',
	MEDIUM: '`Medium`',
	HIGH: '`High`',
	VERY_HIGH: '`Highest`',
};

const notifications = {
	ALL: '`All`',
	MENTIONS: '`Mentions`',
};

module.exports = class ServerInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'serverinfo',
			usage: 'serverinfo',
			description: 'Fetches information and statistics about the server.',
			type: client.types.INFO,
			examples: ['serverinfo'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction) {
		const roleCount = interaction.guild.roles.cache.size - 1;

		const guildOwner = await interaction.client.users.fetch(interaction.guild.ownerID);

		const members = [...interaction.guild.members.cache.values()];
		const memberCount = members.length;
		const online = members.filter((m) => m.presence.status === 'online').length;
		const offline = members.filter((m) => m.presence.status === 'offline').length;
		const dnd = members.filter((m) => m.presence.status === 'dnd').length;
		const afk = members.filter((m) => m.presence.status === 'idle').length;
		const bots = members.filter(b => b.user.bot).length;

		const channels = [...interaction.guild.channels.cache.values()];
		const channelCount = channels.length;
		const textChannels = channels.filter(c => c.type === 'text' && c.viewable).sort((a, b) => a.rawPosition - b.rawPosition);
		const voiceChannels = channels.filter(c => c.type === 'voice').length;
		const newsChannels = channels.filter(c => c.type === 'news').length;
		const categoryChannels = channels.filter(c => c.type === 'category').length;

		const serverStats = stripIndent`
    		  Members  :: [ ${memberCount} ]
    		           :: ${online} Online
    		           :: ${dnd} Busy
    		           :: ${afk} AFK
    		           :: ${offline} Offline
    		           :: ${bots} Bots
    		  Channels :: [ ${channelCount} ]
    		           :: ${textChannels.length} Text
    		           :: ${voiceChannels} Voice
    		           :: ${newsChannels} Announcement
    		           :: ${categoryChannels} Category
    		  Roles    :: [ ${roleCount} ]
    		`;

		const embed = new SignalEmbed(interaction)
			.setTitle(`${interaction.guild.name}'s Information`)
			.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
			.addField('ID', `\`${interaction.guild.id}\``, true)
			.addField(`Owner ${owner}`, `\`${guildOwner.tag}\``, true)
			.addField('Verification Level', verificationLevels[interaction.guild.verificationLevel], true)
			.addField('Rules Channel', (interaction.guild.rulesChannel) ? `${interaction.guild.rulesChannel}` : '`None`', true)
			.addField('System Channel', (interaction.guild.systemChannel) ? `${interaction.guild.systemChannel}` : '`None`', true)
			.addField('AFK Channel', (interaction.guild.afkChannel) ? `${voice} ${interaction.guild.afkChannel.name}` : '`None`', true)
			.addField('AFK Timeout', (interaction.guild.afkChannel) ? `\`${moment.duration(interaction.guild.afkTimeout * 1000).asMinutes()} minutes\`` : '`None`', true)
			.addField('Default Notifications', notifications[interaction.guild.defaultMessageNotifications], true)
			.addField('Partnered', `\`${interaction.guild.partnered}\``, true)
			.addField('Verified', `\`${interaction.guild.verified}\``, true)
			.addField('Created On', `\`${moment(interaction.guild.createdAt).format('MMM DD YYYY')}\``, true)
			.addField('Server Stats', `\`\`\`asciidoc\n${serverStats}\`\`\``);

		if (interaction.guild.description) embed.setDescription(interaction.guild.description);
		if (interaction.guild.bannerURL) embed.setImage(interaction.guild.bannerURL({ dynamic: true }));
		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};