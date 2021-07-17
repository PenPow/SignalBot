const {
	AudioPlayerStatus,
	createAudioPlayer,
	entersState,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
} = require('@discordjs/voice');

function wait(time) {
	return new Promise((resolve) => setTimeout(resolve, time).unref());
}

/**
 * A MusicSubscription exists for each active VoiceConnection. Each subscription has its own audio player and queue,
 * and it also attaches logic to the audio player and voice connection for error handling and reconnection logic.
 */
class MusicSubscription {
	constructor(client, voiceConnection) {
		/**
         * The Voice Connection to the Discord Gateway
         * @type {VoiceConnection}
         */
		this.voiceConnection = voiceConnection;

		/**
		 * The Discord Client
		 * @type {SignalClient}
		 */
		this.client = client;

		/**
         * The actual player that is created to play the music through the voice connection
         * @type {AudioPlayer}
         */
		this.audioPlayer = createAudioPlayer();

		/**
         * The queue of songs to play
         * @type {Track[]}
         */
		this.queue = [];

		this.readyLock = false;
		this.queueLock = false;

		this.voiceConnection.on('stateChange', async (_, newState) => {
			if (newState.status === VoiceConnectionStatus.Disconnected) {
				if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
					/*
						If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
						but there is a chance the connection will recover itself if the reason of the disconnect was due to
						switching voice channels. This is also the same code for the bot being kicked from the voice channel,
						so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
						the voice connection.
					*/
					try {
						await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
						// Probably moved voice channel
					}
					catch {
						try {
							this.voiceConnection.destroy();
							await this.client.subscriptions.delete(this.voiceConnection.joinConfig.guildId);
						// Probably removed from voice channel
						}
						// eslint-disable-next-line no-empty
						catch(e) {

						}
					}
				}
				else if (this.voiceConnection.rejoinAttempts < 5) {
					/*
						The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
					*/
					await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
					this.voiceConnection.rejoin();
				}
				else {
					/*
						The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
					*/
					this.voiceConnection.destroy();
					await this.client.subscriptions.delete(this.voiceConnection.joinConfig.guildId);
				}
			}
			else if (newState.status === VoiceConnectionStatus.Destroyed) {
				/*
					Once destroyed, stop the subscription
				*/
				this.stop();
				await this.client.subscriptions.delete(this.voiceConnection.joinConfig.guildId);
			}
			else if (
				!this.readyLock &&
				(newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
			) {
				/*
					In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
					before destroying the voice connection. This stops the voice connection permanently existing in one of these
					states.
				*/
				this.readyLock = true;
				try {
					await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
				}
				catch {
					if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
						this.voiceConnection.destroy();
						await this.client.subscriptions.delete(this.voiceConnection.joinConfig.guildId);
					}
				}
				finally {
					this.readyLock = false;
				}
			}
		});

		this.audioPlayer.on('stateChange', (oldState, newState) => {
			if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
				// If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
				// The queue is then processed to start playing the next track, if one is available.
				(oldState.resource)?.metadata?.onFinish();
				this.processQueue();
			}
			else if (newState.status === AudioPlayerStatus.Playing) {
				// If the Playing state has been entered, then a new track has started playback.
				(newState.resource)?.metadata?.onStart();
			}
		});

		this.audioPlayer.on('error', (error) => this.client.logger.error(error.stack));

		voiceConnection.subscribe(this.audioPlayer);
	}

	/**
	 * Adds a new track into the queue
	 * @param {Track} track Track to add into the queue
	 */
	enqueue(track) {
		this.queue.push(track);
		void this.processQueue();
	}

	/**
	 * Stops audio playback and empties the queue
	 */
	stop() {
		this.queueLock = true;
		this.queue = [];
		this.audioPlayer.stop(true);
	}

	/**
	 * Attemps to play a track from the queue
	 */
	async processQueue() {
		if (this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle) return;

		if(this.queue.length === 0) {
			try {
				this.audioPlayer.stop(true);
				this.voiceConnection.destroy();
				return await this.client.subscriptions.delete(this.voiceConnection.joinConfig.guildId);
			}
			// eslint-disable-next-line no-empty
			catch(e) {

			}
		}

		this.queueLock = true;

		const nextTrack = this.queue.shift();
		try {
			const resource = await nextTrack.createAudioResource();
			this.audioPlayer.play(resource);
			this.queueLock = false;
		}
		catch (error) {
			this.queueLock = false;
		}
	}
}

module.exports = MusicSubscription;