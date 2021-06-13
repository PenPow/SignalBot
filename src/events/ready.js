const AsciiTable = require('ascii-table');

module.exports = async (client) => {
	const activities = [
		{
			name: 'your commands',
			type: 'LISTENING',
		},
		{
			name: 'to @Signal',
			type: 'LISTENING',
		},
		{
			name: 'the messages go by',
			type: 'WATCHING',
		} ];

	client.logger.info('Loading Slash Commands...');
	const table = new AsciiTable('Slash Commands');
	table.setHeading('Command Name', 'Type', 'Status');

	const commandArray = [];

	client.commands.each(async command => {
		if(command.disabled) return table.addRow(command.name, client.utils.capitalize(command.type), 'Fail');
		if(command.ownerOnly || command.type === client.types.OWNER) return table.addRow(command.name, client.utils.capitalize(command.type), 'Fail');

		commandArray.push(command.generateSlashCommand());

		table.addRow(command.name, client.utils.capitalize(command.type), 'Pass');
	});

	const test_guild = await client.guilds.fetch('789215359878168586');
	test_guild.commands.set(commandArray);
	client.logger.log(table.toString());

	client.user.setPresence({
		status: 'online',
		activity: activities[0],
	});

	let activity = 0;

	setInterval(() => {
		if(activity > 3) activity = 0;
		client.user.setActivity(activities[activity]);
		activity++;
	}, 30000);

	client.logger.warn('Updating Database');

	for(const guild of client.guilds.cache.values()) {
		const modLog = guild.channels.cache.find(c => c.name.replace('-', '').replace('s', '') === 'modlog' || c.name.replace('-', '').replace('s', '') === 'moderatorlog' || c.name.replace('-', '').replace('s', '') === 'log' || c.name.replace('-', '').replace('s', '') === 'serverlogs' || c.name.replace('-', '').replace('s', '') === 'auditlog' || c.name.replace('-', '').replace('s', '') === 'auditlogs');
		const adminRole = guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'admin' || r.name.toLowerCase().replace(/[^a-z]/g, '') === 'administrator');
		const modRole = guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'mod' || r.name.toLowerCase().replace(/[^a-z]/g, '') === 'moderator');
		let muteRole = guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

		if(!muteRole) {
			try {
				muteRole = await guild.roles.create({
					data: {
						name: 'Muted',
						permissions: [],
						reason: 'Creating Mute Role Automatically',
					},
				});
			}
			catch (err) {
				muteRole = undefined;
			}
		}

		if(muteRole) {
			for(const channel of guild.channels.cache.values()) {
				try {
					if(channel.viewable && channel.permissionsFor(guild.me).has('MANAGE_ROLES')) {
						if(channel.type === 'text') {
							await channel.updateOverwrite(muteRole, {
								'SEND_MESSAGES': false,
								'ADD_REACTIONS': false,
							});
						}
						else if(channel.type === 'voice' && channel.editable) {
							await channel.updateOverwrite(muteRole, {
								'SPEAK': false,
								'STREAM': false,
							});
						}
					}
				}
				catch (err) {
					this.client.logger.error(err.stack);
				}
			}
		}

		if(!client.db.get(guild.id)) {

			await client.db.set(guild.id, {
				id: guild.id,
				name: guild.name,
				modLog: modLog ? modLog.id : false,
				adminRole: adminRole ? adminRole.id : false,
				modRole: modRole ? modRole.id : false,
				muteRole: muteRole ? muteRole.id : false,
			});

		}

		await guild.members.cache.forEach(member => {
			let joinedAt = undefined;

			try {
				joinedAt = member.joinedAt().toString();
			}
			catch {
				joinedAt = undefined;
			}

			if(!client.db.get(`${guild.id}_${member.id}`)) {

				client.db.set(`${guild.id}_${member.id}`, {
					guildId: guild.id,
					guildName: guild.name,
					joinedAt: joinedAt ? joinedAt : null,
					bot: member.user.bot ? true : false,
				});
			}
		});
	}

	client.logger.success('Signal is now online');
	client.logger.info(`Signal is running on ${client.guilds.cache.size} servers`);
};