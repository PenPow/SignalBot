class guildCreate {
	constructor(client) {
		this.client = client;
	}

	async run(args) {
		const [guild] = args;
		let muteRole = guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');
		if(!muteRole && guild.permissionsFor(guild.me).has('MANAGE_ROLES')) {
			try {
				muteRole = await guild.roles.create({
					data: {
						name: 'Muted',
						permissions: [],
					},
				});
			}
			catch (err) {
				this.client.logger.error(err.message);
			}
		}

		for(const channel of guild.channels.cache.values()) {
			try {
				if(channel.viewable && channel.permissionsFor(guild.me).has('MANAGE_ROLES')) {
					if(channel.type === 'text') {
						await channel.updateOverwrite(muteRole, {
							'SEND_MESSAGES': false,
							'ADD_REACTIONS': false,
						});
					}
					else if (channel.type === 'voice' && channel.editable) {
						await channel.updateOverwrite(muteRole, {
							'SPEAK': false,
							'STREAM': false,
						});
					}
				}
			}
			catch(err) {
				this.client.logger.error(err.stack);
			}
		}
	}
}

module.exports = guildCreate;