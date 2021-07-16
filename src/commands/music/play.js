/* eslint-disable no-empty-function */
const Command = require('../../structures/Command');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const MusicSubscription = require('../../structures/Subscription');
const Track = require('../../structures/Track');
const { GuildMember } = require('discord.js');
const {
	entersState,
	joinVoiceChannel,
	VoiceConnectionStatus,
} = require('@discordjs/voice');

module.exports = class PlayCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'play',
			usage: 'play <song>',
			aliases: ['enqueue', 'p'],
			description: 'Plays a song in the channel that you are currently in!',
			type: client.types.MUSIC,
			examples: ['play despacito', 'enqueue 7 Rings', 'p Despacito'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}
	async run(message, args) {
		let subscription = this.client.subscriptions.get(message.guild.id);
		if(!subscription) {
			if(message.member instanceof GuildMember && message.member.voice.channel) {
				subscription = new MusicSubscription(
					joinVoiceChannel({
						channelId: message.member.voice.channel.id,
						guildId: message.guild.id,
						adapterCreator: message.guild.voiceAdapterCreator,
					}),
				);
				subscription.voiceConnection.on('error', console.warn);
				this.client.subscriptions.set(message.guild.id, subscription);
			}
		}
		else if(message.member.voice.channel.id !== subscription.voiceConnection.joinConfig.channelId) { return message.reply({ content: 'Please join the voice channel with the bot.' }); }

		if (!subscription) {
			return await message.reply({ content: 'Please join a voice channel' });
		}

		message.reply({ content: '🔎 Searching! Please note that this make take up to 20 seconds while we connect to the voice gateway.' });

		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
		}
		catch (e) {
			this.client.logger.error(e.stack);
			return this.sendErrorMessage(message, 1, 'Signal is experiencing some heavy load right now, and was unable to connect to the voice gateway. This could be an error with the Discord API, so please try again later.', e.message);
		}

		try {
			const url = ytdl.validateURL(args[0]) ? args[0] : (await ytSearch(args.join(' ')))?.all[0]?.url;
			if(!url) return this.sendErrorMessage(message, 0, 'I was unable to find a song to play ');

			const track = await Track.from(url, {
				onStart() {},
				onFinish() {},
				onError(e) {
					this.client.logger.error(e.stack);
				},
			});

			subscription.enqueue(track);
			return await message.reply({ content: `Added \`${track.title}\` to the queue` });
		}
		catch(e) {
			this.client.logger.error(e.stack);
			return this.sendErrorMessage(message, 1, 'Signal is experiencing some heavy load right now, and was unable to connect to the voice gateway. This could be an error with the Discord API, so please try again later.', e.message);
		}
	}

	async slashRun(interaction, args) {
		await interaction.defer({ ephemeral: true });
		let subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!subscription) {
			if(interaction.member instanceof GuildMember && interaction.member.voice.channel) {
				subscription = new MusicSubscription(
					joinVoiceChannel({
						channelId: interaction.member.voice.channel.id,
						guildId: interaction.guild.id,
						adapterCreator: interaction.guild.voiceAdapterCreator,
					}),
				);
				subscription.voiceConnection.on('error', console.warn);
				this.client.subscriptions.set(interaction.guild.id, subscription);
			}
		}
		else if(interaction.member.voice.channel.id !== subscription.voiceConnection.joinConfig.channelId) { return interaction.editReply({ content: 'Please join the voice channel with the bot.', ephemeral: true }); }

		if (!subscription) {
			return await interaction.followUp({ content: 'Please join a voice channel', ephemeral: true });
		}

		await interaction.editReply({ content: '🔎 Searching! Please note that this make take up to 20 seconds while we connect to the voice gateway.' });

		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
		}
		catch (e) {
			this.client.logger.error(e.stack);
			return this.sendSlashErrorMessage(interaction, 1, 'Signal is experiencing some heavy load right now, and was unable to connect to the voice gateway. This could be an error with the Discord API, so please try again later.', e.message);
		}

		try {
			const url = ytdl.validateURL(args.get('song')) ? args.get('song')?.value : (await ytSearch(args.get('song')?.value))?.all[0]?.url;
			if(!url) return this.sendSlashErrorMessage(interaction, 0, 'I was unable to find a song to play ');

			const track = await Track.from(url, {
				onStart() {},
				onFinish() {},
				onError(e) {
					this.client.logger.error(e.stack);
				},
			});

			subscription.enqueue(track);
			return await interaction.followUp({ content: `Added \`${track.title}\` to the queue`, ephemeral: true });
		}
		catch(e) {
			this.client.logger.error(e.stack);
			return this.sendSlashErrorMessage(interaction, 1, 'Signal is experiencing some heavy load right now, and was unable to connect to the voice gateway. This could be an error with the Discord API, so please try again later.', e.message);
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'song',
				type: 'STRING',
				description: 'Search Query / URL to play on youtube',
				required: true,
			}],
		};
	}
};