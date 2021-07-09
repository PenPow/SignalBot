const { promisify } = require('util');

class guildMemberAdd {
	constructor(client) {
		this.client = client;
	}

	async run(args) {
		const exists = promisify(this.client.redis.exists).bind(this.client.redis);

		const [member] = args;

		const { id, guild } = member;

		const muteRole = this.client.db.get(`muterole-${guild.id}`) || guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

		if(!muteRole) return;

		const caseID = this.client.db.get(`lastcase-mute-${id}`)?.caseInfo?.caseID;
		const result = await exists(`mute-${guild.id}-${caseID}`);

		if(result) {
			try {
				await member.roles.add(muteRole.id);
			}
			catch(e) {
				return;
			}
		}
	}
}

module.exports = guildMemberAdd;