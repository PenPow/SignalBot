module.exports = async (client, member) => {
	client.logger.log(`${member.guild.name} - ${member.user.tag} has joined the server`);

	client.db.set(`${member.guild.id}_${member.id}`, {
		guildId: member.guild.id,
		guildName: member.guild.name,
		joinedAt: member.joinedAt.toString(),
		bot: member.user.bot ? true : false,
	});
};