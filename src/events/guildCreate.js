module.exports = async (client, guild) => {
	client.logger.info(`Signal has joined ${guild.name}`);

	const modLog = guild.channels.cache.find(c => c.name.replace('-', '').replace('s', '') === 'modlog' || c.name.replace('-', '').replace('s', '') === 'moderatorlog');
	const adminRole = guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'admin' || r.name.toLowerCase().replace(/[^a-z]/g, '') === 'administrator');
	const modRole = guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'mod' || r.name.toLowerCase().replace(/[^a-z]/g, '') === 'moderator');
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
			client.logger.error(err.message);
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
			client.logger.error(err.stack);
		}
	}

	client.db.set(guild.id, {
		id: guild.id,
		name: guild.name,
		modLog: modLog ? modLog.id : false,
		adminRole: adminRole ? adminRole.id : false,
		modRole: modRole ? modRole.id : false,
		muteRole: muteRole ? muteRole.id : false,
	});

	guild.members.cache.forEach(member => {
		client.db.set(`${guild.id}_${member.id}`, {
			guildId: guild.id,
			guildName: guild.name,
			joinedAt: member.joinedAt.toString(),
			bot: member.user.bot ? true : false,
		});
	});
};