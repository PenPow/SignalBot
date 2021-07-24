const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

module.exports = class DisableCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'disable',
			usage: 'disable <command | category>',
			description: 'Disables a module/command',
			type: client.types.ADMIN,
			examples: ['disable music', 'disable cat'],
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['ADMINISTRATOR'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		if(!args[0]) return this.sendErrorMessage(message, 1, 'Please provide a command/category to disable');
		const toDisable = args[0];

		if(['disable', 'enable'].includes(toDisable.toLowerCase())) return this.sendErrorMessage(message, 0, 'Cannot disable this command, as it would brick Signal');

		if(Object.values(this.client.types).indexOf(toDisable.toLowerCase()) > -1) {
			this.client.db.push(`${message.guild.id}-disabled-modules`, toDisable.toLowerCase());
		}
		else if (this.client.commands.get(toDisable.toLowerCase())?.name === 'eval') { return this.sendErrorMessage(message, 0, 'No Command/Module with that name found'); }
		else if(this.client.commands.get(toDisable.toLowerCase()) || this.client.aliases.get(toDisable.toLowerCase())) {
			const command = this.client.commands.get(toDisable.toLowerCase()) || this.client.aliases.get(toDisable.toLowerCase());

			this.client.db.push(`${message.guild.id}-disabled-commands`, command.name.toLowerCase());
		}
		else {
			return this.sendErrorMessage(message, 0, 'No Command/Module with that name found');
		}

		const embed = new SignalEmbed(message)
			.setTitle('Disabled Successfully')
			.setDescription('I have successfully blocked the command/module from being executed in this guild');

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const toDisable = args.get('command')?.value;

		if(['disable', 'enable'].includes(toDisable.toLowerCase())) return this.sendErrorMessage(interaction, 0, 'Cannot disable this command, as it would brick Signal');

		if(Object.values(this.client.types).indexOf(toDisable.toLowerCase()) > -1) {
			this.client.db.push(`${interaction.guild.id}-disabled-modules`, toDisable.toLowerCase());
		}
		else if (this.client.commands.get(toDisable.toLowerCase())?.name === 'eval') { return this.sendErrorMessage(interaction, 0, 'No Command/Module with that name found'); }
		else if(this.client.commands.get(toDisable.toLowerCase()) || this.client.aliases.get(toDisable.toLowerCase())) {
			const command = this.client.commands.get(toDisable.toLowerCase()) || this.client.aliases.get(toDisable.toLowerCase());

			this.client.db.push(`${interaction.guild.id}-disabled-commands`, command.name.toLowerCase());
		}
		else {
			return this.sendErrorMessage(interaction, 0, 'No Command/Module with that name found');
		}

		const embed = new SignalEmbed(interaction)
			.setTitle('Disabled Successfully')
			.setDescription('I have successfully blocked the command/module from being executed in this guild');

		interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'command',
				type: 'STRING',
				description: 'The command/module you wish to disable',
				required: true,
			}],
		};
	}
};