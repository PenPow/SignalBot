const Discord = require('discord.js');
const Enmap = require('enmap');
const redis = require('redis');
const api = require('amethyste-api');
const ActionManager = require('../managers/ActionManager');

/**
 * Signal's Custom Discord Client
 * @extends Discord.Client
 * @class
 * @author Joshua Clements
 * @description Custom Client
 * @public
 */
class Client extends Discord.Client {
	/**
     * Creates a new client
     * @param {Object} config
     * @param {ClientOptions} options
     */
	constructor(config, options = {}) {
		super(options);

		/**
         * Creates Logger
         * @type {Logger}
         */
		this.logger = require('consola');

		/**
         * Creates Database
         * @type {Enmap}
         */
		this.db = new Enmap({
			name: 'database',
			persistent: true,
			fetchAll: true,
			autoFetch: true,
		});

		/**
         * Possible Command Types
         * @type {Object}
         */
		this.types = {
			INFO: 'info',
			FUN: 'fun',
			MISC: 'misc',
			MUSIC: 'music',
			MOD: 'mod',
			ADMIN: 'admin',
		};

		/**
         * Collection of Commands
         * @type {Collection<string, Command>}
         */
		this.commands = new Discord.Collection();

		/**
         * Collection of Aliases
         * @type {Collection<string, Command>}
         */
		this.aliases = new Discord.Collection();

		/**
         * Music Subscriptions
         * @type {Collection<Snowflake, MusicSubscription>}
         */
		this.subscriptions = new Discord.Collection();

		/**
         * Discord Token
         * @type {string}
         */
		this.token = config.apiKeys.discord.token;

		/**
         * API Keys
         * @type {Object}
         */
		this.apiKeys = config.apiKeys;

		/**
         * Configuration
         * @type {Object}
         */
		this.config = require('../../config.json');

		/**
         * Signal Owner ID
         * @type {string}
         */
		this.ownerId = config.configuration.ownerId;

		/**
         * Utility Functions
         * @type {Object}
         */
		this.utils = require('../utils/utils');

		/**
		 * Redis Database
		 * @type {redis.RedisClient | null}
		 */
		this.redis = null;

		/**
		 * Action Manager
		 * @private
		 * @type {ActionManager}
		 */
		this.actionManager = new ActionManager();

		/**
		 * Images API
		 * @type {api}
		 */
		this.images = new api(this.config.apiKeys.amethyste.token);

		this.logger.info('Initalizing...');
	}

	/**
	 * Inits the Client
	 * @returns {Promise<void>}
	 */
	async init() {
		try {
			this.actionManager.initCommands(this);
			this.actionManager.initEvents(this);
			this.redis = this.actionManager.initRedis(this);
			await this.login(this.token);
		}
		catch (e) {
			this.logger.error(`Failed to Init: ${e.stack}`);
		}
	}

	/**
	 * Redis Expiry Database
	 * @returns {Callback}
	 */
	expire(callback) {
		const expired = () => {
			const sub = redis.createClient({ url: this.config.apiKeys.redis.url });
			sub.subscribe('__keyevent@0__:expired', () => {
				sub.on('message', (_, message) => {
					callback(message);
				});
			});
		};

		const pub = redis.createClient({ url: this.config.apiKeys.redis.url });
		pub.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], expired());
	}

	/**
     * Check is user is the bot owner
     * @param {User} user
     */
	isOwner(user) {
		if(user.id === this.ownerId) return true;
		else return false;
	}

	/**
     * Checks if voice channel is same as user channel
     * @param {string} botVoiceChannel
     * @param {string} userVoiceChannel
     */
	checkVoiceChannel(botVoiceChannel, userVoiceChannel) {
		if(botVoiceChannel.id !== userVoiceChannel.id) return false;
		return true;
	}
}

/**
 * Exports Client Function
 * @exports Client
 */
module.exports = Client;
