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
		if(activity >= 3) activity = 0;
		client.user.setActivity(activities[activity]);
		activity++;
	}, 30000);

	client.logger.warn('Updating Database');

	client.logger.warn('Checking For Expired Punishments');
	client.db.ensure('global_mutes', []);
	client.db.ensure('global_bans', []);

	const mutes = client.db.get('global_mutes');
	const bans = client.db.get('global_bans');

	client.expire((message) => {
		const messageArray = message.split('-');
		const caseInfo = client.db.get(`case-${messageArray[1]}-${messageArray[2]}`);

		if(caseInfo.caseInfo.type === 'mute') {
			for(let i = 0; i < mutes.length; i++) {
				if(mutes[i].caseInfo.caseID.toString() === caseInfo.caseInfo.caseID.toString()) mutes.splice(i, 1);
				client.db.set('global_mutes', mutes);
			}

			client.utils.unmute(client, caseInfo);
		}
		else if(caseInfo.caseInfo.type === 'ban') {
			for(let i = 0; i < bans.length; i++) {
				if(bans[i].caseInfo.caseID.toString() === caseInfo.caseInfo.caseID.toString()) bans.splice(i, 1);
				client.db.set('global_bans', bans);
			}


			client.utils.unban(client, caseInfo);
		}
	});

	for(let i = 0; i < mutes.length; i++) {
		if(mutes[i].caseInfo.expiry < Math.floor(new Date(Date.now()).getTime())) {
			client.utils.unmute(client, mutes[i]);
			mutes.splice(i);
			client.db.set('global_mutes', mutes);
		}

		const guild = await client.guilds.fetch(mutes[i].guild);
		const muteRole = client.db.get(`muterole-${guild.id}`) || guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

		if(!muteRole) return;

		const member = await guild.members.fetch(mutes[i].caseInfo.target);

		await member.roles.add(muteRole.id);
	}

	for(let i = 0; i < bans.length; i++) {
		if(bans[i].caseInfo.expiry < Math.floor(new Date(Date.now()).getTime())) {
			if(bans[i].caseInfo.expiry === null) continue;
			client.utils.unban(client, bans[i]);
			bans.splice(i, 1);
			client.db.set('global_bans', bans);
		}
	}

	for(const guild of client.guilds.cache.values()) {
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
			catch (err) {} // eslint-disable-line 
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
				catch (err) {} // eslint-disable-line 
			}
			client.db.set(`muterole-${guild.id}`, muteRole);
		}
	}

	client.logger.success('Signal is now online');
	client.logger.info(`Signal is running on ${client.guilds.cache.size} servers`);
};