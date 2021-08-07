const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class EnableCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'enable',
			usage: 'enable <command | category>',
			description: 'Enables a disabled module/command',
			type: client.types.ADMIN,
			examples: ['enable mod', 'enable cat'],
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['ADMINISTRATOR'],
		});
	}

	async run(interaction, args) {
		const toEnable = args.get('command')?.value;
		const keyExists = this.client.db.includes(`${interaction.guild.id}-disabled-modules`, toEnable.toLowerCase()) || this.client.db.includes(`${interaction.guild.id}-disabled-commands`, toEnable.toLowerCase());
		if((Object.values(this.client.types).indexOf(toEnable.toLowerCase()) > -1) && keyExists) {
			this.client.db.remove(`${interaction.guild.id}-disabled-modules`, toEnable.toLowerCase());
		}
		else if((this.client.commands.get(toEnable.toLowerCase())) && keyExists) {
			const command = this.client.commands.get(toEnable.toLowerCase());

			this.client.db.remove(`${interaction.guild.id}-disabled-commands`, command.name.toLowerCase());
		}
		else {
			return this.sendErrorMessage(interaction, 0, 'No Command/Module with that name found or it was not disabled in the first place, if you encounter this issue, try enabling the module');
		}

		const embed = new SignalEmbed(interaction)
			.setTitle('Enabled Successfully')
			.setDescription('I have successfully allowed the command/module from being executed in this guild');

		interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'command',
				type: ApplicationCommandOptionType.String,
				description: 'The command/module you wish to enable',
				required: true,
			}],
		};
	}
};