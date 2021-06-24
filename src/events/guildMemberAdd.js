const { promisify } = require('util');

module.exports = async (client, member) => {
	const exists = promisify(client.redis.exists).bind(client.redis);

	const { id, guild } = member;

	const muteRole = client.db.get(`muterole-${guild.id}`) || guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

	if(!muteRole) return;

	const caseID = client.db.get(`lastcase-mute-${id}`)?.caseInfo?.caseID;
	const result = await exists(`mute-${guild.id}-${caseID}`);

	if(result) {
		try {
			await member.roles.add(muteRole.id);
		}
		catch(e) {
			return;
		}
	}
};