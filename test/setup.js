const chalk = require('chalk');
const fetch = require('node-fetch');
const { createClient } = require('redis');
const fs = require('fs');
const path = require('path');
const readLastLines = require('read-last-lines');

const success = (message) => console.log(`   ${chalk.green('✓')} ${message}`);
const error = (message, howToFix) => console.log(`   ${chalk.red('✗')} ${message}${howToFix ? ` : ${howToFix}` : ''}`);
const info = (message) => console.log(`   ${chalk.blue(String.fromCodePoint(0x2139))} ${message}`);
const ignore = (message) => console.log(`   ${chalk.yellow('~')} ${message}`);

const checks = [
	() => {
		info('Environment');
		return new Promise((resolve, reject) => {
			let shouldReject = false;
			if(parseInt(process.version.split('.')[0].split('v')[1]) >= 12) {
				success('Node Version');
			}
			else {
				error('Node Version < 14', 'Install Node V14 or Greater');
				shouldReject = true;
			}

			try {
				require('discord.js');
				success('Packages Should Be Installed\n');
			}
			catch {
				error('Packages not installed', 'Install with "yarn install" and then run me with "yarn node ." to ensure the bot starts up correctly\n');
				shouldReject = true;
			}

			if(shouldReject) { reject(); }
			else { resolve(); }
		});
	},
	() => {
		info('API');

		let shouldReject = false;

		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			if(!process.env.AMETHYSTE_TOKEN) {
				error('Amethyste API Key Not Configured', 'Generate one at https://api.amethyste.moe/');
				shouldReject = true;
			}
			else {
				const res = await fetch('https://v1.api.amethyste.moe/generate/blurple', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${process.env.AMETHYSTE_TOKEN}`,
					},
				});
				const result = await res.json();
				if(result.status === 401) {
					error('Invalid Amethyste API key', 'Generate one at https://api.amethyste.moe/');
					shouldReject = true;
				}
				else {
					success('Valid Amethyste API key');
				}
			}

			if(!process.env.CAT_TOKEN) {
				error('Cat API Not Configured', 'Generate one at https://thecatapi.com/\n');
				shouldReject = true;
			}
			else {
				const res = await fetch('https://api.thecatapi.com/v1/images/search', { headers: { 'x-api-key': process.env.CAT_TOKEN } });
				const result = (await res.json())[0];
				if(result.status === 401) {
					error('Invalid Cat API key', 'Generate one at https://thecatapi.com/\n');
					shouldReject = true;
				}
				else {
					success('Valid Cat API key\n');
				}
			}

			if(shouldReject) { reject(); }
			else { resolve(); }
		});
	},
	() => {
		info('Redis');

		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			if(!process.env.REDIS_PORT) {
				ignore('No Redis Port Set, Defaulting to 6739');
			}
			if(!process.env.REDIS_IP) {
				error('Redis not Configured', 'Setup a Redis Database and Provide the IP + Port, should you require authentication, you can find a guide on the Wiki.\n');
				reject();
			}
			else {
				try {
					const client = await createClient({
						host: 'localhost',
						port: process.env.REDIS_PORT || 6379,
						enable_offline_queue: true,
						db: 0,
						retry_strategy: function(options) {
							if(options.error) {
								error('Failed to connect to Redis', 'Check the credentials, should you require authentication, you can find a guide on the Wiki.\n');
								reject();
							}
						},
					});

					client.on('ready', () => {
						success('Connected to Redis\n');
						resolve();
					});

					client.on('error', () => {
						reject();
					});

					client.on('warning', () => {
						error('You need to provide authentication to access this redis database, to do so, view the guide on the Github Wiki\n');
						reject();
					});
				}
				// eslint-disable-next-line no-empty
				catch {}
			}
		});
	},
	() => {
		info('Discord Bot');

		return new Promise((resolve, reject) => {
			const { Intents } = require('discord.js');
			const Client = require('../src/structures/Client');

			const intents = new Intents();
			intents.add(
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.DIRECT_MESSAGES,
				Intents.FLAGS.GUILD_BANS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_VOICE_STATES,
			);

			const client = new Client({
				intents: intents,
				allowedMentions: { parse: ['users', 'everyone', 'roles'], repliedUser: false },
				partials: ['USER', 'CHANNEL', 'MESSAGE'],
				presence: {
					status: 'online',
					activities: [{ name: 'to @Signal', type: 'LISTENING' }],
				},
			});

			client.login(process.env.DISCORD_TOKEN).then(async () => {
				success('Valid Bot Token\n');
				resolve();
			}).catch(() => {
				error('Invalid Bot Token', 'To get your bot token, visit https://discord.com/developers/applications/me | https://goo.gl/EQ25Rb\n');
				reject();
			});

		});
	},
];

const test = async () => {
	const line = (await readLastLines.read(path.join(global.__basedir, './.env'), 1));
	if(line === 'SETUP_COMPLETE = TRUE') return true;

	console.log(chalk.yellow('Verifying the Installation Environment'));

	let testResult = true;

	for(const check of checks) {
		try {
			await check();
		}
		catch(e) {
			testResult = false;
		}
	}

	if(testResult && line !== 'SETUP_COMPLETE = TRUE') {
		await fs.appendFileSync(path.join(global.__basedir, './.env'), '\n\n# Do Not Touch, doing so will corrupt the installation\nSETUP_COMPLETE = TRUE');
	}

	if(testResult) { success('Successfully Verified Installation\n'); }
	else { error('Failed to Validate Installation'); }
	return testResult;
};

module.exports.test = test;