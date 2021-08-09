const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { success, mod } = require('../../utils/emojis');

module.exports = class KickCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'kick',
			usage: 'kick <user mention/ID> [reason]',
			description: 'Kicks a user from the server.',
			type: client.types.MOD,
			examples: ['kick @PenPow He was mean', 'kick @PenPow Naughty'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
			userPermissions: ['KICK_MEMBERS'],
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

		if (!member) return this.sendErrorMessage(interaction, 0, 'Please provide a user');
		if (member === interaction.member) return this.sendErrorMessage(interaction, 0, 'You cannot kick yourself');
		if (member === interaction.guild.me) return this.sendErrorMessage(interaction, 0, 'You cannot kick me');
		if (!member.kickable) return this.sendErrorMessage(interaction, 0, 'Provided member is not kickable');
		if (member.roles.highest.position >= interaction.member.roles.highest.position || !member.manageable) return this.sendErrorMessage(interaction, 0, 'You cannot kick someone with an equal or higher role');
		if (member.user.bot) return this.sendErrorMessage(interaction, 0, 'I cannot punish a bot.');

		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);

		const embed = new SignalEmbed(interaction)
			.setTitle(`${success} Kicked Member ${mod}`)
			.setDescription(`${member} has now been kicked.`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }));

		const embed2 = new SignalEmbed(interaction)
			.setTitle(`${mod} You were Kicked from ${interaction.guild.name}`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }));

		await member.user.send({ embeds: [embed2] }).catch();

		await member.kick({ reason: `Kicked by ${interaction.user.tag} | Case #${caseID}` });

		let reference = this.client.db.get(`case-${interaction.guild.id}-${args.get('reference')?.value.replace('#', '')}`);

		if(!reference) {reference = null;}

		const modLog = interaction.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');
		const sentMessage = await modLog.messages.fetch(reference?.caseInfo?.auditId).catch();

		reference = { caseId: reference?.caseInfo?.caseID, url: sentMessage?.url };
		if(!sentMessage && !reference) reference = null;

		const kickObject = {
			guild: interaction.guild.id,
			channel: interaction.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'kick',
				target: member.id,
				moderator: interaction.user.id,
				reason: reason,
				date: new Date(Date.now()).getTime(),
				reference: reference,
				auditId: await this.sendModLogMessage(interaction, reason, member.id, 'kick', caseID, null, reference),
			},
		};

		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, kickObject);
		this.client.db.ensure(`sanctions-${member.id}`, []);
		this.client.db.push(`sanctions-${member.id}`, kickObject);

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
				description: '(Optional) Case for reference',
				required: false,
			}],
		};
	}
};