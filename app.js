/**
 * Signal Bot
 *
 * Copyright (c) 2021 Joshua Clements
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @name @PenPow/SignalBot
 * @description Signal is a discord bot that aims to be fast, responsive, and highly useful for server owners.
 * @copyright 2021 Joshua Clements
 * @license MIT
 */
process.title = 'Signal Discord Bot';

const Client = require('./src/structures/Client');
const { Intents } = require('discord.js');
require('dotenv').config();

/**
 * @global
 */
global.__basedir = __dirname;

/**
 * Constructs new Intents
 * @type {Intents}
 */
const intents = new Intents();
intents.add(
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MEMBERS,
);

/**
 * Constructs new Client
 * @type {Client}
 */
const client = new Client({
	intents: intents,
	allowedMentions: { parse: ['users', 'everyone', 'roles'], repliedUser: false },
	failIfNotExists: true,
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
process.on('unhandledRejection', err => client.logger.error(err));