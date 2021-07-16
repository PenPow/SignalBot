const { getInfo } = require('ytdl-core');
const { createAudioResource, demuxProbe } = require('@discordjs/voice');
const { raw: ytdl } = require('youtube-dl-exec');

// eslint-disable-next-line no-empty-function
const noop = () => {};

/**
 * A Track represents information about a YouTube video (in this context) that can be added to a queue.
 * It contains the title and URL of the video, as well as functions onStart, onFinish, onError, that act
 * as callbacks that are triggered at certain points during the track's lifecycle.
 *
 * Rather than creating an AudioResource for each video immediately and then keeping those in a queue,
 * we use tracks as they don't pre-emptively load the videos. Instead, once a Track is taken from the
 * queue, it is converted into an AudioResource just in time for playback.
 */
class Track {
	constructor({ url, title, onStart, onFinish, onError }) {
		/**
         * The URL of the Youtube Video to Play
         * @type {string}
         */
		this.url = url;

		/**
         * The Title of the Track
         * @type {string}
         */
		this.title = title;

		/**
         * The Function called on Start
         * @type {() => void}
         */
		this.onStart = onStart;

		/**
         * The Function called on Finish
         * @type {() => void}
         */
		this.onFinish = onFinish;

		/**
         * The Function called on Error
         * @type {() => void}
         */
		this.onError = onError;
	}

	/**
     * Creates an audio resource to send to the Subscription
     */
	createAudioResource() {
		return new Promise((resolve, reject) => {
			const process = ytdl(
				this.url,
				{
					o: '-',
					q: '',
					f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
					r: '100K',
				},
				{ stdio: ['ignore', 'pipe', 'ignore'] },
			);

			if(!process.stdout) {
				reject(new Error('No Stdout Formed'));
			}

			const stream = process.stdout;

			const onError = (error) => {
				if (!process.killed) process.kill();
				stream.resume();
				reject(error);
			};

			process.once('spawn', () => {
				demuxProbe(stream).then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })));
			}).catch(onError);
		});
	}

	/**
     * Takes a URL and creates a track out of it.
     * @param {string} url
     * @param {Function} methods
     * @returns {this}
     */
	static async from(url, methods) {
		const info = await getInfo(url);

		const wrappedMethods = {
			onStart() {
				wrappedMethods.onStart = noop;
				methods.onStart();
			},
			onFinish() {
				wrappedMethods.onFinish = noop;
				methods.onFinish();
			},
			onError(error) {
				wrappedMethods.onError = noop;
				methods.onError(error);
			},
		};

		return new Track({
			title: info.videoDetails.title,
			url,
			...wrappedMethods,
		});
	}
}

module.exports = Track;