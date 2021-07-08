const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const { success, mod } = require('../../utils/emojis');
const { promisify } = require('util');

module.exports = class UnmuteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unmute',
			usage: 'mute <user mention/ID | caseID> [reason]',
			description: 'Unmutes the specified user.',
			type: client.types.MOD,
			examples: ['unmute @PenPow Successfully Appealed Punishment'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
			userPermissions: ['MANAGE_ROLES', 'MANAGE_MESSAGES'],
			guilds: ['GLOBAL'],
			guldOnly: true,
		});
	}
	async run(message, args) {
		const exists = promisify(this.client.redis.exists).bind(this.client.redis);
		const muteRole = this.client.db.get(`muterole-${message.guild.id}`) || message.guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

		if(!muteRole) return this.sendErrorMessage(message, 1, 'There is currently no mute role set on this server');

		let member;

		try {
			if(this.client.db.get(`case-${message.guild.id}-${args[0]}`)?.caseInfo?.type === 'mute') member = await message.guild.members.fetch(this.client.db.get(`case-${message.guild.id}-${args[0]}`)?.caseInfo?.target);
			member = await this.getMemberFromMention(message, args[0]) || (await message.guild.members.fetch(args[0]));
		}
		catch(e) {
			// eslint disable-line
		}

		if (!args[0] || !member) return this.sendErrorMessage(message, 0, 'Please mention a user, provide a valid user ID, or provide a valid case ID');
		if (member.roles.highest.position >= message.member.roles.highest.position) return this.sendErrorMessage(message, 0, 'You cannot umute someone with an equal or higher role');

		let reason = args.slice(2).join(' ');
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		if (!member.roles.cache.has(muteRole.id)) return this.sendErrorMessage(message, 0, 'Provided member is not muted');
		if (member.user.bot) return this.sendErrorMessage(message, 0, 'I cannot edit a bot.');

		const approved = await this.client.utils.confirmation(message, `Are you sure you want to unmute \`${member.user.tag}\`?`, message.author.id);

		if(!approved) return this.sendErrorMessage(message, 1, 'Cancelled Command (Command Timed Out or Confirmation Declined)');

		const caseID = this.client.utils.getCaseNumber(this.client, message.guild);
		const oldCaseInfo = this.client.db.get(`lastcase-mute-${member.id}`);

		const embed = new MessageEmbed()
			.setTitle(`${success} Unmuted Member ${mod}`)
			.setDescription(`${member} has now been unmuted`)
			.addField('Moderator', `<@${message.author.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		const redisClient = this.client.redis;
		if(oldCaseInfo) {
			const redisKey = `mute-${message.guild.id}-${oldCaseInfo?.caseInfo?.caseID}`;
			try {
				redisClient.expire(redisKey, 1);
			}
			catch(e) {
				this.client.logger.error(e.stack);
			}

			if(!exists(redisKey)) {
				await message.guild.bans.fetch();
				await message.guild.bans.remove(member.id.toString(), 'Ban Revoked/Expired');
			}

			this.client.db.set(`case-${message.guild.id}`, caseID);

			const mutes = this.client.db.get('global_mutes');
			for(let i = 0; i < mutes.length; i++) {
				if(mutes[i].caseInfo.caseID === oldCaseInfo.caseInfo.caseID) this.client.db.set('global_mutes', mutes.splice(i, 1));
			}
		}

		else {
			this.client.utils.unmute(this.client, { guild: message.guild.id, member: member.id, moderator: message.author.id });
		}

		const muteObject = {
			guild: message.guild.id,
			channel: message.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'unmute',
				target: member.id,
				moderator: message.author.id,
				reason: reason,
				expiry: null,
				auditId: await this.sendModLogMessage(message, reason, member.id, 'unmute'),
			},
		};

		message.reply({ embeds: [embed] });
		this.client.db.set(`case-${message.guild.id}-${caseID}`, muteObject);
	}

	async slashRun(interaction, args) {
		const muteRole = this.client.db.get(`muterole-${interaction.guild.id}`) || interaction.guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

		if(!muteRole) return this.sendSlashErrorMessage(interaction, 1, 'There is currently no mute role set on this server');

		let member;

		try {
			member = args.get('user')?.member || (await interaction.guild.members.fetch(this.client.db.get(`case-${interaction.guild.id}-${parseInt(args.get('caseid')?.value)}`)?.caseInfo?.target));
		}
		catch(e) {
			// eslint disable-line
		}

		if(!member) member = (await interaction.guild.members.fetch());

		if (!member) return this.sendSlashErrorMessage(interaction, 0, 'Please mention a user, or provide a valid case ID');
		if (member.roles.highest.position >= interaction.member.roles.highest.position) return this.sendSlashErrorMessage(interaction, 0, 'You cannot umute someone with an equal or higher role');

		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		if (member.user.bot) return this.sendSlashErrorMessage(interaction, 0, 'I cannot edit a bot.');

		if (!member.roles.cache.has(muteRole.id)) return this.sendSlashErrorMessage(interaction, 0, 'Provided member is not muted');

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);
		const oldCaseInfo = this.client.db.get(`lastcase-mute-${member.id}`);

		const embed = new MessageEmbed()
			.setTitle(`${success} Unmuted Member ${mod}`)
			.setDescription(`${member} has now been unmuted`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		const redisClient = this.client.redis;

		if(oldCaseInfo) {
			try {
				const redisKey = `mute-${interaction.guild.id}-${oldCaseInfo.caseInfo.caseID}`;
				redisClient.expire(redisKey, 1);
			}
			catch(e) {
				this.client.logger.error(e.stack);
			}

			this.client.db.set(`case-${interaction.guild.id}`, caseID);

			const mutes = this.client.db.get('global_mutes');
			for(let i = 0; i < mutes.length; i++) {
				if(mutes[i].caseInfo.caseID === oldCaseInfo.caseInfo.caseID) this.client.db.set('global_mutes', mutes.splice(i, 1));
			}
		}

		else {
			this.client.utils.unmute(this.client, { guild: interaction.guild.id, member: member.id, moderator: interaction.user.id });
		}

		interaction.reply({ ephemeral: true, embeds: [embed] });

		const muteObject = {
			guild: interaction.guild.id,
			channel: interaction.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'unmute',
				target: member.id,
				moderator: interaction.user.id,
				reason: reason,
				expiry: null,
				auditId: await this.sendSlashModLogMessage(interaction, reason, member.id, 'unmute'),
			},
		};
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, muteObject);
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'user',
				type: 'USER',
				description: 'User to remove the mute for',
				required: false,
			},
			{
				name: 'caseid',
				type: 'INTEGER',
				description: 'Case ID of the punishment to remove',
				required: false,
			},
			{
				name: 'reason',
				type: 'STRING',
				description: '(Optional) Reason for the removal of the punishment',
				required: false,
			}],
		};
	}
};