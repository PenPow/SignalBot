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
			description: 'Plays a song in the channel that you are currently in!',
			type: client.types.MUSIC,
			examples: ['play youtube despacito'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		message.reply('🔎 Searching! Please note that this make take up to 20 seconds while we connect to the voice gateway.');
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

		if (!subscription) {
			return await message.reply({ content: 'Please join a voice channel' });
		}

		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
		}
		catch (e) {
			this.client.logger.error(e.stack);
			return await message.reply({ content: 'I am experiencing some heavy load right now, please try again later.' });
		}

		try {
			const url = ytdl.validateURL(args[0]) ? args[0] : (await ytSearch(args.join(' ')))?.all[0]?.url;
			if(!url) return await message.reply({ content: 'I was unable to find a video to play, please try again later.' });

			const track = await Track.from(url, {
				onStart() {},
				onFinish() {},
				onError(e) {
					this.client.logger.error(e.stack);
				},
			});

			subscription.enqueue(track);
			return await message.reply({ content: `Added ${track.title} to the queue` });
		}
		catch(e) {
			this.client.logger.error(e.stack);
			return await message.reply({ content: 'I am experiencing some heavy load right now, please try again later.' });
		}
	}

	// async slashRun(interaction, args) {
	// }

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'message',
				type: 'STRING',
				description: 'Message to send to our team',
				required: true,
			}],
		};
	}
};