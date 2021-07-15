const config = require('./config.json');
const Client = require('./src/structures/Client');
const { Intents } = require('discord.js');

/**
 * @global
 */
global.__basedir = __dirname; // eslint-disable-line

const nodeMajorVersion = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajorVersion < 14) {
	console.error('Unsupported NodeJS version! Please install Node.js 14 or above');
	process.exit(1);
}

/**
 * Constructs new Intents
 * @type {Intents}
 */
const intents = new Intents();
intents.add(
	'GUILDS',
	'GUILD_MESSAGES',
	'DIRECT_MESSAGES',
	'GUILD_BANS',
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
	presence: {
		status: 'online',
		activities: [{ name: 'to @Signal', type: 'LISTENING' }],
	},
});

/**
 * Initalizes the Client
 * @type {Function}
 */
async function init() {
	await client.init();
}

init();

/**
 * Handles Promise Rejections
 * @type {Event}
*/
process.on('unhandledRejection', err => client.logger.error(err)); // eslint-disable-line