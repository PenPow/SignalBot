const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
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
			guldOnly: true,
		});
	}

	async run(interaction, args) {
		await interaction.deferReply();
		const muteRole = this.client.db.get(`muterole-${interaction.guild.id}`) || interaction.guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

		if(!muteRole) return this.sendErrorMessage(interaction, 1, 'There is currently no mute role set on this server');

		let member;

		try {
			member = args.get('user')?.member || (await interaction.guild.members.fetch(this.client.db.get(`case-${interaction.guild.id}-${parseInt(args.get('caseid')?.value.replace('#', ''))}`)?.caseInfo?.target));
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

		try {
			const redisKey = `mute-${interaction.guild.id}-${oldCaseInfo.caseInfo.caseID}`;
			redisClient.del(redisKey);
		}
		catch(e) {
			this.client.logger.error(e.stack);
		}
		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		const mutes = this.client.db.get('global_mutes');
		for(let i = 0; i < mutes.length; i++) {
			if(mutes[i].caseInfo.caseID === oldCaseInfo.caseInfo.caseID) this.client.db.set('global_mutes', mutes.splice(i, 1));
		}
		try {
			const guildmember = await interaction.guild.members.fetch(member.id);
			const role = this.client.db.get(`muterole-${interaction.guild.id}`) || interaction.guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');
			guildmember.roles.remove(role.id);
		}
		catch(e) {
			// eslint disable-line
		}
		const unmuteEmbed = new SignalEmbed(interaction)
			.setTitle(`${mod} Your Mute Expired (or was removed) in ${interaction.guild.name}`)
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		member.send({ embeds: [unmuteEmbed] }).catch();

		let reference = this.client.db.get(`case-${interaction.guild.id}-${args.get('reference')?.value.replace('#', '')}`) ?? oldCaseInfo;

		const modLog = interaction.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');
		const sentMessage = await modLog.messages.fetch(reference.caseInfo.auditId);

		reference = { caseId: reference?.caseInfo?.caseID, url: sentMessage?.url };
		if(!sentMessage && !reference) reference = null;

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
				reference: reference,
				auditId: await this.sendModLogMessage(interaction, reason, member.id, 'unmute', caseID, Infinity, { caseId: oldCaseInfo.caseInfo.caseID, url: sentMessage.url }),
			},
		};

		this.client.db.ensure('alreadyProcessed', []);
		this.client.db.push('alreadyProcessed', oldCaseInfo.caseInfo.caseID);
		this.client.db.push('alreadyProcessed', caseID);


		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, muteObject);
		this.client.db.ensure(`sanctions-${member.id}`, []);
		this.client.db.push(`sanctions-${member.id}`, muteObject);

		interaction.editReply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'user',
				type: ApplicationCommandOptionType.User,
				description: 'User to remove the mute for',
				required: false,
			},
			{
				name: 'caseid',
				type: ApplicationCommandOptionType.Integer,
				description: 'Case ID of the punishment to remove',
				required: false,
			},
			{
				name: 'reason',
				type: ApplicationCommandOptionType.String,
				description: '(Optional) Reason for the removal of the punishment',
				required: false,
			},
			{
				name: 'reference',
				type: ApplicationCommandOptionType.String,
				description: '(Optional) Case for reference',
				required: false,
			}],
		};
	}
};