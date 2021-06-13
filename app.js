const config = require('./config.json');
const Client = require('./src/Client.js');
const { Intents } = require('discord.js');

/**
 * @global
 */
global.__basedir = __dirname; // eslint-disable-line

/**
 * Constructs new Intents
 * @type {Intents}
 */
const intents = new Intents();
intents.add(
	'GUILDS',
	'GUILD_MESSAGES',
	'GUILD_MESSAGE_REACTIONS',
	'DIRECT_MESSAGES',
	'DIRECT_MESSAGE_REACTIONS',
	'GUILD_BANS',
	'GUILD_VOICE_STATES',
	'GUILD_PRESENCES',
	'GUILD_MEMBERS',
);

/**
 * Constructs new Client
 * @type {Client}
 */
const client = new Client(config, {
	intents: intents,
	allowedMentions: { parse: ['users', 'everyone', 'roles'], repliedUser: false },
	partials: ['USER', 'CHANNEL', 'MESSAGE'],
});

/**
 * Initalizes the Client
 * @type {Function}
 */
function init() {
	client.loadEvents('./src/events');
	client.loadCommands('./src/commands');
	client.login(client.token);
}

init();

/**
 * Handles Promise Rejections
 * @type {Event}
*/
process.on('unhandledRejection', err => client.logger.error(err)); // eslint-disable-line