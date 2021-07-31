const { MessageEmbed } = require('discord.js');

class Ready {
	constructor(client) {
		this.client = client;
	}

	async run() {
		this.client.logger.warn('Checking For Expired Punishments');
		this.client.db.ensure('global_mutes', []);
		this.client.db.ensure('global_bans', []);
		this.client.db.ensure('global_reminders', []);

		const mutes = this.client.db.get('global_mutes');
		const bans = this.client.db.get('global_bans');
		const reminders = this.client.db.get('global_reminders');

		const commandArray = [];

		this.client.expire(async (message) => {
			const messageArray = message.split('-');

			if(messageArray[0] === 'reminder') {
				const info = this.client.db.get(`reminder_${messageArray[1]}`);

				if(!info) return;

				const author = await this.client.users.fetch(info.user);

				if(!author) return;

				const embed = new MessageEmbed()
					.setTitle('Reminder!')
					.setDescription(`Created at <t:${info.createdAt}:F> \n\n\`${info.message}\``)
					.setColor('#5864ef')
					.setFooter(`${author.tag}`, author.displayAvatarURL({ dynamic: true }));

				author.send({ embeds: [embed] }).catch();

				for(let i = 0; i < reminders.length; i++) {
					if(info === reminders[i]) reminders.splice(i, 1);
					this.client.db.set('global_reminders', reminders);
				}

			}
			else {
				const caseInfo = this.client.db.get(`case-${messageArray[1]}-${messageArray[2]}`);

				if(!caseInfo) return;

				if(caseInfo.caseInfo.type === 'mute') {
					for(let i = 0; i < mutes.length; i++) {
						if(mutes[i].caseInfo.caseID.toString() === caseInfo.caseInfo.caseID.toString()) mutes.splice(i, 1);
						this.client.db.set('global_mutes', mutes);
					}

					this.client.utils.unmute(this.client, caseInfo);
				}
				else if(caseInfo.caseInfo.type === 'ban') {
					for(let i = 0; i < bans.length; i++) {
						if(bans[i].caseInfo.caseID.toString() === caseInfo.caseInfo.caseID.toString()) bans.splice(i, 1);
						this.client.db.set('global_bans', bans);
					}


					this.client.utils.unban(this.client, caseInfo);
				}
			}

		});

		for(let i = 0; i < mutes.length; i++) {
			if(mutes[i].caseInfo.expiry < Math.floor(new Date(Date.now()).getTime())) {
				this.client.utils.unmute(this.client, mutes[i]);
				mutes.splice(i);
				this.client.db.set('global_mutes', mutes);
			}

			const guild = await this.client.guilds.fetch(mutes[i]?.guild);

			if(!guild) return;
			const muteRole = this.client.db.get(`muterole-${guild.id}`) || guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

			if(!muteRole) return;

			const member = await guild.members.fetch(mutes[i].caseInfo.target);

			await member.roles.add(muteRole.id);
		}

		for(let i = 0; i < bans.length; i++) {
			if(bans[i].caseInfo.expiry < Math.floor(new Date(Date.now()).getTime())) {
				if(bans[i].caseInfo.expiry === null) continue;
				this.client.utils.unban(this.client, bans[i]);
				bans.splice(i, 1);
				this.client.db.set('global_bans', bans);
			}
		}

		for(let i = 0; i < reminders.length; i++) {
			if(reminders[i].expireAt < (new Date(Date.now()).getTime() / 1000).toFixed(0)) {
				const info = reminders[i];
				reminders.splice(i, 1);
				this.client.db.set('global_reminders', reminders);

				const author = await this.client.users.fetch(info.user);

				if(!author) return;

				const embed = new MessageEmbed()
					.setTitle('Reminder!')
					.setDescription(`Created at <t:${info.createdAt}:F> \n\n\`${info.message}\``)
					.setColor('#5864ef')
					.setFooter(`${author.tag}`, author.displayAvatarURL({ dynamic: true }));

				author.send({ embeds: [embed] }).catch();
			}
		}

		for(const guild of this.client.guilds.cache.values()) {
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
				this.client.db.set(`muterole-${guild.id}`, muteRole);
			}
		}

		this.client.logger.success('Signal is now online');
		this.client.logger.info(`Signal is running on ${this.client.guilds.cache.size} servers`);
	}
}

module.exports = Ready;