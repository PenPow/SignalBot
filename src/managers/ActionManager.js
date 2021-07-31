const { join, resolve } = require('path');
const { readdirSync, readdir } = require('fs');
const { createClient } = require('redis');

/**
 * Signal's Custom Action Manager
 * @extends Discord.Client
 * @class
 * @author Joshua Clements
 * @description Action Manager
 * @public
 */
class ActionManager {
	/**
     * Parses files into commands from the configured command path.
     * @param {SignalClient} client The original client, for access to the configuration.
     * @returns {void}
    */
	initCommands(client) {
		readdirSync(join(global.__basedir, 'src/commands')).filter(f => !f.endsWith('.js')).forEach(dir => {
			const commands = readdirSync(resolve(join(join(global.__basedir, 'src/commands'), dir))).filter(f => f.endsWith('js'));
			commands.forEach(f => {
				const Command = require(resolve(join(join(global.__basedir, 'src/commands'), dir, f)));
				const command = new Command(client);
				if(command.name && !command.disabled) {
					client.commands.set(command.name, command);

					if(command.aliases) {
						command.aliases.forEach((alias) => {
							client.aliases.set(alias, command);
						});
					}
				}
			});
		});
	}

	/**
     * Initializes every event from the configured event path.
     * @param {SignalClient} client The original client, for access to the configuration.
     * @returns {void}
    */
	initEvents(client) {
		readdir(join(global.__basedir, 'src/events'), (err, files) => {
			if (err) client.logger.error(err);

			files.forEach(evt => {
				const Event = require(join(
					global.__basedir,
					'src/events/',
					evt,
				));

				const event = new Event(client);
				const eventName = evt.split('.')[0];

				client.on(
					eventName,
					(...args) => event.run(args),
				);
			});
		});
	}

	/**
     * Initializes the Redis Database
     * @param {SignalClient} client The original client, for access to the configuration.
     * @returns {RedisClient}
     */
	initRedis(client) {
		return createClient({
			host: client.config.apiKeys.redis.ip,
			enable_offline_queue: true,
			db: 0,
		});
	}
}

module.exports = ActionManager;