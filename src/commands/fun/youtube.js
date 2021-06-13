const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

const { fun } = require('../../utils/emojis.js');

const search = require('youtube-search');
const he = require('he');


module.exports = class YoutubeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'youtube',
			usage: 'youtube <video name>',
			aliases: ['yt'],
			description: 'Searches youtube for the given video',
			type: client.types.FUN,
			examples: ['youtube Baby Shark', 'yt Despacito'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		const apiKey = message.client.apiKeys.googleApi.token;
		const videoName = args.join(' ');
		if (!videoName) return this.sendErrorMessage(message, 0, 'Please provide a YouTube video name');
		const searchOptions = { maxResults: 1, key: apiKey, type: 'video' };
		if (!message.channel.nsfw) searchOptions['safeSearch'] = 'strict';

		let result = await search(videoName, searchOptions)
			.catch(err => {
				message.client.logger.error(err);
				return this.sendErrorMessage(message, 1, 'Please try again in a few seconds', err.message);
			});

		result = result.results[0];

		if(!result) return this.sendErrorMessage(message, 0, 'Unable to find video, please provide a different YouTube video name');
		const decodedTitle = he.decode(result.title);

		const embed = new MessageEmbed()
			.setTitle(`${fun} ${decodedTitle}`)
			.setURL(result.link)
			.setThumbnail('https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-512.png')
			.setDescription(result.description)
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		if(message.channel.nsfw) embed.setImage(result.thumbnails.high.url);
		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const apiKey = interaction.client.apiKeys.googleApi.token;
		const videoName = args.first()?.value;
		const searchOptions = { maxResults: 1, key: apiKey, type: 'video' };
		if (!interaction.channel.nsfw) searchOptions['safeSearch'] = 'strict';

		let result = await search(videoName, searchOptions)
			.catch(err => {
				interaction.client.logger.error(err);
				return this.sendSlashErrorMessage(interaction, 1, 'Please try again in a few seconds', err.message);
			});

		result = result.results[0];

		if(!result) return this.sendSlashErrorMessage(interaction, 0, 'Unable to find video, please provide a different YouTube video name');
		const decodedTitle = he.decode(result.title);

		const embed = new MessageEmbed()
			.setTitle(`${fun} ${decodedTitle}`)
			.setURL(result.link)
			.setThumbnail('https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-512.png')
			.setDescription(result.description)
			.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		if(interaction.channel.nsfw) embed.setImage(result.thumbnails.high.url);
		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'search_term',
				type: 'STRING',
				description: 'The youtube video search term',
				required: true,
			}],
		};
	}
};