const Command = require('../Command.js');

module.exports = class ReloadCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reload',
			usage: 'reload <command>',
			description: 'Reloads a Command',
			type: client.types.OWNER,
			ownerOnly: true,
			examples: ['reload ping'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['789215359878168586'],
		});
	}
	async run(message, args) {
		if(!args[0]) return this.sendErrorMessage(message, 0, 'You must provide a command to reload');
		const oldCommand = message.client.commands.get(args[0].toLowerCase());
		if (oldCommand.aliases) {
			oldCommand.aliases.forEach(async alias => {
				await message.client.aliases.delete(alias);
			});
		}

		try {
			delete require.cache[require.resolve(`${process.cwd()}/src/commands/${oldCommand.type}/${args[0].toLowerCase()}.js`)];
			await this.client.commands.delete(args[0].toLowerCase());
			const CommandStructure = require(`${process.cwd()}/src/commands/${oldCommand.type}/${args[0].toLowerCase()}.js`);
			const command = new CommandStructure(message.client);
			if (command.name && !command.disabled) {
				this.client.commands.set(command.name, command);
				if (command.aliases) {
					command.aliases.forEach(async alias => {
						await this.client.aliases.set(alias, command);
					});
				}
				message.reply(`Succesfully reloaded \`${this.client.utils.capitalize(args[0])}\``);
			}
		}
		catch(err) {
			return this.sendErrorMessage(message, 1, `Could not reload: ${args[0]}`, err.stack);
		}
	}
};