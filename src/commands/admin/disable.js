const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class DisableCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'disable',
			usage: 'disable <command | category>',
			description: 'Disables a module/command',
			type: client.types.ADMIN,
			examples: ['disable mod', 'disable cat'],
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['ADMINISTRATOR'],
		});
	}

	async run(interaction, args) {
		const toDisable = args.get('command')?.value;

		if(['disable', 'enable'].includes(toDisable.toLowerCase())) return this.sendErrorMessage(interaction, 0, 'Cannot disable this command, as it would brick Signal');

		if(Object.values(this.client.types).indexOf(toDisable.toLowerCase()) > -1) {
			this.client.db.push(`${interaction.guild.id}-disabled-modules`, toDisable.toLowerCase());
		}
		else if(this.client.commands.get(toDisable.toLowerCase())) {
			const command = this.client.commands.get(toDisable.toLowerCase());

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
				type: ApplicationCommandOptionType.String,
				description: 'The command/module you wish to disable',
				required: true,
			}],
		};
	}
};