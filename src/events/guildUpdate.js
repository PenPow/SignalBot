module.exports = async (client, oldGuild, newGuild) => {
    if (oldGuild.name == newGuild.name) return;

    let oldInfo = client.db.get(oldGuild.id)
    oldInfo.name = newGuild.name;

    client.db.set(oldGuild.id, oldInfo)

    client.logger.info(`${oldGuild.name} server name changed to ${newGuild.name}`);
}