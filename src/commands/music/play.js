/* eslint-disable no-empty-function */
const Command = require('../../structures/Command');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const MusicSubscription = require('../../structures/Subscription');
const Track = require('../../structures/Track');
const { GuildMember } = require('discord.js');
const SignalEmbed = require('../../structures/SignalEmbed');
const { undeafened } = require('../../utils/emojis.js');
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
				subscription = new MusicSubscription(this.client,
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
		else if(message.member.voice.channel.id !== subscription.voiceConnection.joinConfig.channelId) { return this.sendErrorMessage(message, 2, 'You need to be in the same voice channel as the bot'); }

		if (!subscription) {
			return this.sendErrorMessage(message, 2, 'Please join a voice channel');
		}

		const embed = new SignalEmbed(message)
			.setTitle('🔎 Searching!')
			.setDescription('Please note that this make take up to 5 seconds while we connect to the voice gateway.');

		message.reply({ embeds: [embed] });

		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 10e3);
		}
		catch (e) {
			if(!message.member.voice.channel.members.has(message.guild.me)) {
				try {
					await subscription.voiceConnection.destroy();
					await subscription.stop();
					await this.client.subscriptions.delete(message.guild.id);

					subscription = new MusicSubscription(this.client,
						joinVoiceChannel({
							channelId: message.member.voice.channel.id,
							guildId: message.guild.id,
							adapterCreator: message.guild.voiceAdapterCreator,
						}),
					);
					subscription.voiceConnection.on('error', console.warn);
					this.client.subscriptions.set(message.guild.id, subscription);

					try {
						await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 5e3);
					}
					catch (err) {
						this.client.logger.error(err.stack);
						return this.sendErrorMessage(message, 1, 'Signal is experiencing some heavy load right now, and was unable to connect to the voice gateway. This could be an error with the Discord API, so please try again later.', err.message);
					}
				}
				catch(err) {
					return this.sendErrorMessage(message, 1, 'Signal is experiencing some heavy load right now, and was unable to connect to the voice gateway. This could be an error with the Discord API, so please try again later.', err.message);
				}
			}
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

			embed.setTitle(`${undeafened} Found ${track.title}`)
				.setDescription(`Added \`${track.title}\` to the queue`);
			return await message.reply({ embeds: [embed] });
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
				subscription = new MusicSubscription(this.client,
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
		else if(interaction.member.voice.channel.id !== subscription.voiceConnection.joinConfig.channelId) { return this.sendSlashErrorMessage(interaction, 2, 'Please join the voice channel with the bot.'); }

		if (!subscription) {
			return await this.sendSlashErrorMessage(interaction, 2, 'Please join a voice channel');
		}

		const embed = new SignalEmbed(interaction)
			.setTitle('🔎 Searching!')
			.setDescription('Please note that this make take up to 5 seconds while we connect to the voice gateway.');

		interaction.editReply({ embeds: [embed], ephemeral: true });

		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 5e3);
		}
		catch (e) {
			if(!interaction.member.voice.channel.members.has(interaction.guild.me)) {
				try {
					await subscription.voiceConnection.destroy();
					await subscription.stop();
					await this.client.subscriptions.delete(interaction.guild.id);

					subscription = new MusicSubscription(this.client,
						joinVoiceChannel({
							channelId: interaction.member.voice.channel.id,
							guildId: interaction.guild.id,
							adapterCreator: interaction.guild.voiceAdapterCreator,
						}),
					);
					subscription.voiceConnection.on('error', console.warn);
					this.client.subscriptions.set(interaction.guild.id, subscription);

					try {
						await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 5e3);
					}
					catch (err) {
						this.client.logger.error(err.stack);
						return this.sendSlashErrorMessage(interaction, 1, 'Signal is experiencing some heavy load right now, and was unable to connect to the voice gateway. This could be an error with the Discord API, so please try again later.', err.message);
					}
				}
				catch(err) {
					return this.sendSlashErrorMessage(interaction, 1, 'Signal is experiencing some heavy load right now, and was unable to connect to the voice gateway. This could be an error with the Discord API, so please try again later.', err.message);
				}
			}
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
			embed.setTitle(`${undeafened} Found ${track.title}`)
				.setDescription(`Added \`${track.title}\` to the queue`);
			return await interaction.followUp({ embeds: [embed], ephemeral: true });
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