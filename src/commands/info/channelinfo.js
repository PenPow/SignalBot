const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const moment = require('moment');
const { voice } = require('../../utils/emojis.js');
const { oneLine, stripIndent } = require('common-tags');
const channelTypes = {
	dm: 'DM',
	text: 'Text',
	voice: 'Voice',
	category: 'Category',
	news: 'News',
	store: 'Store',
};

module.exports = class ChannelInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'channelinfo',
			aliases: ['channel', 'ci'],
			usage: 'channelinfo [channel mention/ID]',
			description: oneLine`
      			  Fetches information about the channel. 
      			  If no channel is given, the current channel will be used.
      			`,
			type: client.types.INFO,
			guilds: ['GLOBAL'],
			examples: ['channelinfo #general', 'channel #general', 'ci #general'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}
	async run(message, args) {
		let channel = (await this.getChannelFromMention(message, args[0])) || message.guild.channels.cache.get(args[0]);
		if (channel) {
			args.shift();
		}
		else {channel = message.channel;}
		const embed = new SignalEmbed(message)
			.setTitle('Channel Information')
			.setThumbnail(message.guild.iconURL({ dynamic: true }))
			.addField('Channel', `\`${channel.name}\``, true)
			.addField('ID', `\`${channel.id}\``, true)
			.addField('Type', `\`${channelTypes[channel.type]}\``, true)
			.addField('Members', `\`${channel.members.size}\``, true)
			.addField('Bots', `\`${channel.members.array().filter(b => b.user.bot).length}\``, true)
			.addField('Created On', `\`${moment(channel.createdAt).format('MMM DD YYYY')}\``, true);

		if (channel.type === 'text') {
			embed
				.addField('Rate Limit', `\`${channel.rateLimitPerUser}\``, true)
				.addField('NSFW', `\`${channel.nsfw}\``, true);
		}
		else if (channel.type === 'news') {
			embed
				.addField('NSFW', `\`${channel.nsfw}\``, true);
		}
		else if (channel.type === 'voice') {
			embed
				.addField('Channel', `\`${voice} ${channel.name}\``, true)
				.addField('User Limit', `\`${channel.userLimit}\``, true)
				.addField('Full', `\`${channel.full}\``, true);
			const members = channel.members.array();
			if (members.length > 0) {embed.addField('Members Joined', message.client.utils.trimArray(channel.members.array()).join(' '));}
		}
		else {
			return this.sendErrorMessage(message, 0, stripIndent`
      Please enter mention a valid text or announcement channel` +
      ' or provide a valid text, announcement, or voice channel ID',
			);
		}
		if (channel.topic) embed.addField('Topic', channel.topic);
		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const channel = interaction.guild.channels.cache.get(args?.first()?.value) || interaction.channel;

		const embed = new SignalEmbed(interaction)
			.setTitle('Channel Information')
			.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
			.addField('Channel', `\`${channel.name}\``, true)
			.addField('ID', `\`${channel.id}\``, true)
			.addField('Type', `\`${channelTypes[channel.type]}\``, true)
			.addField('Members', `\`${channel.members.size}\``, true)
			.addField('Bots', `\`${channel.members.array().filter(b => b.user.bot).length}\``, true)
			.addField('Created On', `\`${moment(channel.createdAt).format('MMM DD YYYY')}\``, true);

		if (channel.type === 'text') {
			embed
				.spliceFields(3, 0, { name: 'Rate Limit', value: `\`${channel.rateLimitPerUser}\``, inline: true })
				.spliceFields(6, 0, { name: 'NSFW', value: `\`${channel.nsfw}\``, inline: true });
		}
		else if (channel.type === 'news') {
			embed
				.spliceFields(6, 0, { name: 'NSFW', value: `\`${channel.nsfw}\``, inline: true });
		}
		else if (channel.type === 'voice') {
			embed
				.spliceFields(0, 1, { name: 'Channel', value: `${voice} ${channel.name}`, inline: true })
				.spliceFields(5, 0, { name: 'User Limit', value: `\`${channel.userLimit}\``, inline: true })
				.spliceFields(6, 0, { name: 'Full', value: `\`${channel.full}\``, inline: true });
			const members = channel.members.array();
			if (members.length > 0) {embed.addField('Members Joined', interaction.client.utils.trimArray(channel.members.array()).join(' '));}
		}
		else {
			return this.sendSlashErrorMessage(interaction, 0, stripIndent`
      Please enter mention a valid text or announcement channel` +
      ' or provide a valid text, announcement, or voice channel ID',
			);
		}
		if (channel.topic) embed.addField('Topic', channel.topic);
		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'channel',
				type: 'CHANNEL',
				description: '(Optional) Info about the channel specified, defaults to this channel if none is given.',
				required: false,
			}],
		};
	}
};