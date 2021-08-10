const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { success, mod } = require('../../utils/emojis');

module.exports = class WarnCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'warn',
			usage: 'warn <user mention/ID> [reason]',
			description: 'Warns a user.',
			type: client.types.MOD,
			examples: ['warn @PenPow He was mean', 'warn @PenPow Naughty'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_MESSAGES'],
			guildOnly: true,
		});
	}

	async run(interaction, args) {
		await interaction.deferReply();
		let member;

		try {
			member = args.get('user')?.member;
		}
		catch(e) {
			// eslint disable-line
		}

		if (member === interaction.member) return this.sendErrorMessage(interaction, 0, 'You cannot warn yourself');
		if (member === interaction.guild.me) return this.sendErrorMessage(interaction, 0, 'You cannot warn me');
		if (!member.kickable) return this.sendErrorMessage(interaction, 0, 'Provided member is not warnable');
		if (member.roles.highest.position >= interaction.member.roles.highest.position || !member.manageable) return this.sendErrorMessage(interaction, 0, 'You cannot warn someone with an equal or higher role');
		if (member.user.bot) return this.sendErrorMessage(interaction, 0, 'I cannot punish a bot.');

		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);

		const embed = new SignalEmbed(interaction)
			.setTitle(`${success} Warned Member ${mod}`)
			.setDescription(`${member} has now been warned.`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }));

		const embed2 = new SignalEmbed(interaction)
			.setTitle(`${mod} You were warned in ${interaction.guild.name}`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }));

		await member.user.send({ embeds: [embed2] }).catch();

		let reference = this.client.db.get(`case-${interaction.guild.id}-${args.get('reference')?.value.replace('#', '')}`);

		if(!reference) {reference = null;}
		else {
			const modLog = interaction.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');
			const sentMessage = await modLog.messages.fetch(reference.caseInfo.auditId).catch();
			reference = { caseId: reference?.caseInfo?.caseID, url: sentMessage?.url };
		}

		const warnObject = {
			guild: interaction.guild.id,
			channel: interaction.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'warn',
				date: new Date(Date.now()).getTime(),
				target: member.id,
				moderator: interaction.user.id,
				reason: reason,
				reference: reference,
				auditId: await this.sendModLogMessage(interaction, reason, member.id, 'warn', caseID, null, reference),
			},
		};

		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, warnObject);
		this.client.db.ensure(`sanctions-${member.id}`, []);
		this.client.db.push(`sanctions-${member.id}`, warnObject);

		interaction.editReply({ ephemeral: false, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'user',
				type: ApplicationCommandOptionType.User,
				description: 'User to apply the moderation actions to',
				required: true,
			},
			{
				name: 'reason',
				type: ApplicationCommandOptionType.String,
				description: '(Optional) Reason for the punishment',
				required: false,
			},
			{
				name: 'reference',
				type: ApplicationCommandOptionType.String,
				description: '(Optional) A case to reference with this punishment (Useful for Ban Evasion)',
				required: false,
			}],
		};
	}
};