class interactionCreate {
	constructor(client) {
		this.client = client;
	}

	async run(args) {
		const [interaction] = args;
		if(!interaction.isCommand()) return;

		this.client.db.ensure(`${interaction.guild.id}_prefix`, 's!');

		const cmd = interaction.commandName;

		const command = this.client.commands.get(cmd);
		if(command.ownerOnly && !this.client.isOwner(interaction.user)) return await interaction.reply('You cannot use this command', { ephemeral: true });
		if((command.type === this.client.types.OWNER) && !this.client.isOwner(interaction.user)) return await interaction.reply('You cannot use this command', { ephemeral: true });
		if(command.guildOnly && !interaction.guild) return await interaction.reply('This command can only be used in a guild channel.', { ephemeral: true });

		if(!command.checkSlashUserPermissions(interaction)) return;
		command.slashRun(interaction, interaction.options, this.client.subscriptions.get(interaction.guild.id));
	}
}

module.exports = interactionCreate;