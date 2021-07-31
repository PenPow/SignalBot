const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { success, mod } = require('../../utils/emojis');

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

	async slashRun(interaction, args) {
		const muteRole = this.client.db.get(`muterole-${interaction.guild.id}`) || interaction.guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

		if(!muteRole) return this.sendErrorMessage(interaction, 1, 'There is currently no mute role set on this server');

		let member;

		try {
			member = args.get('user')?.member || (await interaction.guild.members.fetch(this.client.db.get(`case-${interaction.guild.id}-${parseInt(args.get('caseid')?.value)}`)?.caseInfo?.target));
		}
		catch(e) {
			// eslint disable-line
		}

		if(!member) member = (await interaction.guild.members.fetch());

		if (!member) return this.sendErrorMessage(interaction, 0, 'Please mention a user, or provide a valid case ID');
		if (member.roles.highest.position >= interaction.member.roles.highest.position) return this.sendErrorMessage(interaction, 0, 'You cannot umute someone with an equal or higher role');

		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		if (member.user.bot) return this.sendErrorMessage(interaction, 0, 'I cannot edit a bot.');

		if (!member.roles.cache.has(muteRole.id)) return this.sendErrorMessage(interaction, 0, 'Provided member is not muted');

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);
		const oldCaseInfo = this.client.db.get(`lastcase-mute-${member.id}`);

		const embed = new SignalEmbed(interaction)
			.setTitle(`${success} Unmuted Member ${mod}`)
			.setDescription(`${member} has now been unmuted`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }));

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
				date: new Date(Date.now()).getTime(),
				auditId: await this.sendModLogMessage(interaction, reason, member.id, 'unmute'),
			},
		};
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, muteObject);
		this.client.db.ensure(`sanctions-${member.id}`, []);
		this.client.db.push(`sanctions-${member.id}`, muteObject);
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