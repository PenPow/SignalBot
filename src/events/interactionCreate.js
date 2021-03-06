class interactionCreate {
	constructor(client) {
		this.client = client;
	}

	async run(args) {
		const [interaction] = args;
		if(!interaction.isCommand()) return;

		this.client.db.ensure(`${interaction.guild.id}_prefix`, 's!');

		this.client.db.ensure(`${interaction.guild.id}-disabled-commands`, []);
		this.client.db.ensure(`${interaction.guild.id}-disabled-modules`, []);

		const cmd = interaction.commandName;

		const command = this.client.commands.get(cmd);

		const disabled = { modules: this.client.db.get(`${interaction.guild.id}-disabled-modules`), commands: this.client.db.get(`${interaction.guild.id}-disabled-commands`) };
		if(disabled.modules.includes(command.type) || disabled.commands.includes(command.name.toLowerCase())) return command.sendErrorMessage(interaction, 1, 'This command is disabled in this guild');

		if(command.guildOnly && !interaction.guild) return await interaction.reply('This command can only be used in a guild channel.', { ephemeral: true });

		if(!command.checkPermissions(interaction)) return;

		command.run(interaction, interaction.options);
	}
}

module.exports = interactionCreate;