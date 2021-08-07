const Discord = require('discord.js');
const Enmap = require('enmap');
const redis = require('redis');
const api = require('amethyste-api');
const setup = require('../../test/setup.js');
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
     * @param {ClientOptions} options
     */
	constructor(options = {}) {
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
		this.images = new api(process.env.AMETHYSTE_TOKEN);
	}

	/**
	 * Inits the Client
	 * @returns {Promise<void>}
	 */
	async init(dry = false) {
		if(!dry) await this.verifyConfig();
		this.logger.info('Initalizing...');
		try {
			this.actionManager.initCommands(this);
			this.actionManager.initEvents(this, dry);
			this.redis = this.actionManager.initRedis();
			await this.login(process.env.DISCORD_TOKEN);
		}
		catch (e) {
			this.logger.error(`Failed to Init: ${e.stack}`);
		}
	}

	/**
	 * Verifies the Configuration Provided
	 */
	async verifyConfig() {
		const environment = await setup.test();
		if(!environment) process.exit(1);
	}

	/**
	 * Redis Expiry Database
	 * @returns {Callback}
	 */
	expire(callback) {
		try {
			const expired = () => {
				const sub = redis.createClient({ host: process.env.REDIS_IP, port: process.env.REDIS_PORT || 6379 });
				sub.subscribe('__keyevent@0__:expired', () => {
					sub.on('message', (_, message) => {
						callback(message);
					});
				});
			};

			const pub = redis.createClient({ host: process.env.REDIS_IP, port: process.env.REDIS_PORT || 6379 });
			pub.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], expired());
		}
		catch {
			this.logger.error('Failed to Connect to the Punishment Database, check the Redis Credentials are correct');
			process.exit(1);
		}
	}

	/**
     * Check is user is the bot owner
     * @param {User} user
     */
	isOwner(user) {
		if(user.id === process.env.OWNER_ID) return true;
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
