module.exports = async (client, interaction) => {
	if(!interaction.isCommand()) return;

	client.db.ensure(`${interaction.guild.id}_prefix`, 's!');

	const cmd = interaction.commandName;

	const command = client.commands.get(cmd);
	if(command.ownerOnly && !client.isOwner(interaction.user)) return await interaction.reply('You cannot use this command', { ephemeral: true });
	if((command.type === client.types.OWNER) && !client.isOwner(interaction.user)) return await interaction.reply('You cannot use this command', { ephemeral: true });
	if(command.guildOnly && !interaction.guild) return await interaction.reply('This command can only be used in a guild channel.', { ephemeral: true });

	if(!command.checkSlashUserPermissions(interaction)) return;
	command.slashRun(interaction, interaction.options);
};