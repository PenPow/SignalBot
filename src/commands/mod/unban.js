const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success, mod } = require('../../utils/emojis');
const { promisify } = require('util');

module.exports = class UnbanCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unban',
			usage: 'unban <userID | caseID> [reason]',
			description: 'Unbans the specified user.',
			type: client.types.MOD,
			examples: ['unban @PenPow Successfully Appealed Punishment'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
			userPermissions: ['MANAGE_ROLES', 'MANAGE_MESSAGES'],
			guilds: ['GLOBAL'],
			guldOnly: true,
		});
	}
	async run(message, args) {
		const exists = promisify(this.client.redis.exists).bind(this.client.redis);

		let member;
		try {
			if(this.client.db.get(`case-${message.guild.id}-${args[0]}`)?.caseInfo?.type === 'ban') member = (await message.client.users.fetch(this.client.db.get(`case-${message.guild.id}-${args[0]}`)?.caseInfo?.target));
			else member = await message.client.users.fetch(args[0]);
		}
		catch(e) {
			// eslint disable-line
		}

		if (!args[0] || !member) return this.sendErrorMessage(message, 0, 'Please mention a user, provide a valid user ID, or provide a valid case ID');

		let reason = args.slice(1).join(' ');
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		if (member.bot) return this.sendErrorMessage(message, 0, 'I cannot edit a bot.');

		const approved = await this.client.utils.confirmation(message, `Are you sure you want to unban \`${member.tag}\`?`, message.author.id);

		if(!approved) return this.sendErrorMessage(message, 1, 'Cancelled Command (Command Timed Out or Confirmation Declined)');

		const caseID = this.client.utils.getCaseNumber(this.client, message.guild);
		const oldCaseInfo = this.client.db.get(`lastcase-ban-${member.id}`);

		const embed = new MessageEmbed()
			.setTitle(`${success} Unbanned Member ${mod}`)
			.setDescription(`${member} has now been unbanned`)
			.addField('Moderator', `<@${message.author.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		const redisClient = this.client.redis;

		const muteObject = {
			guild: message.guild.id,
			channel: message.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'unban',
				target: member.id,
				moderator: message.author.id,
				reason: reason,
				expiry: null,
				auditId: await this.sendModLogMessage(message, reason, member.id, 'unban'),
			},
		};

		this.client.db.set(`case-${message.guild.id}`, caseID);
		this.client.db.set(`case-${message.guild.id}-${caseID}`, muteObject);

		if(oldCaseInfo) {
			const redisKey = `ban-${message.guild.id}-${oldCaseInfo?.caseInfo?.caseID}`;
			const keyExists = await exists(redisKey);
			if(!keyExists) {
				await message.guild.bans.fetch();
				message.guild.members.unban(member, 'Ban Revoked/Expired');
			}
			else {
				try {
					redisClient.expire(redisKey, 1);
				}
				catch(e) {
					this.client.logger.error(e.stack);
				}
			}

			const bans = this.client.db.get('global_bans');
			for(let i = 0; i < bans.length; i++) {
				if(bans[i].caseInfo.caseID === oldCaseInfo.caseInfo.caseID) this.client.db.set('global_mutes', bans.splice(i, 1));
			}
		}

		else {
			message.guild.members.unban(member, 'Ban Revoked/Expired');
		}

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const exists = promisify(this.client.redis.exists).bind(this.client.redis);

		let member;
		try {
			if(args.get('caseid')?.value) member = (await interaction.client.users.fetch(this.client.db.get(`case-${interaction.guild.id}-${args.get('caseid')?.value}`)?.caseInfo?.target));
			else member = (await interaction.client.users.fetch(args.get('user')?.value));
		}
		catch(e) {
			// eslint disable-line
		}

		if (!member) return this.sendSlashErrorMessage(interaction, 0, 'Please mention a user, provide a valid user ID, or provide a valid case ID');

		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		if (member.bot) return this.sendSlashErrorMessage(interaction, 0, 'I cannot edit a bot.');

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);
		const oldCaseInfo = this.client.db.get(`lastcase-ban-${member.id}`);

		const embed = new MessageEmbed()
			.setTitle(`${success} Unbanned Member ${mod}`)
			.setDescription(`${member} has now been unbanned`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		const redisClient = this.client.redis;

		const muteObject = {
			guild: interaction.guild.id,
			channel: interaction.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'unban',
				target: member.id,
				moderator: interaction.user.id,
				reason: reason,
				expiry: null,
				auditId: await this.sendSlashModLogMessage(interaction, reason, member.id, 'unban'),
			},
		};

		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, muteObject);

		if(oldCaseInfo) {
			const redisKey = `ban-${interaction.guild.id}-${oldCaseInfo?.caseInfo?.caseID}`;
			const keyExists = await exists(redisKey);
			if(!keyExists) {
				interaction.guild.members.unban(member, 'Ban Revoked/Expired');
			}
			else {
				try {
					redisClient.expire(redisKey, 1);
				}
				catch(e) {
					this.client.logger.error(e.stack);
				}
			}

			const bans = this.client.db.get('global_bans');
			for(let i = 0; i < bans.length; i++) {
				if(bans[i].caseInfo.caseID === oldCaseInfo.caseInfo.caseID) this.client.db.set('global_mutes', bans.splice(i, 1));
			}
		}

		else {
			interaction.guild.members.unban(member, 'Ban Revoked/Expired');
		}

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'user',
				type: 'STRING',
				description: 'UserID to remove the ban for',
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