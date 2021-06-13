module.exports = async (client, member) => {
    if (member.user === client.user) return;

    client.logger.log(`${member.guild.name} - ${member.user.tag} has left the server`);
}