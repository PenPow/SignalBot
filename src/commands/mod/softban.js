const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { success, mod } = require('../../utils/emojis');

module.exports = class SoftBanCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'softban',
			usage: 'softban <user mention/ID> [reason]',
			description: 'Bans and then immediatly unbans a user to remove all their messages.',
			type: client.types.MOD,
			examples: ['softban @PenPow He was mean'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}

	async run(interaction, args) {
		let member;

		try {
			member = await args.get('user')?.member;
		}
		catch(e) {
			// eslint disable-line
		}

		if (!member) return this.sendErrorMessage(interaction, 0, 'Please mention a user or provide a valid user ID');
		if (member === interaction.member) return this.sendErrorMessage(interaction, 0, 'You cannot softban yourself');
		if (member === interaction.guild.me) return this.sendErrorMessage(interaction, 0, 'You cannot softban me');
		if (!member.bannable) return this.sendErrorMessage(interaction, 0, 'Provided member is not bannable');
		if (member.roles.highest.position >= interaction.member.roles.highest.position || !member.manageable) return this.sendErrorMessage(interaction, 0, 'You cannot softban someone with an equal or higher role');
		if (member.user.bot) return this.sendErrorMessage(interaction, 0, 'I cannot punish a bot.');

		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);

		const embed = new SignalEmbed(interaction)
			.setTitle(`${success} Banned Member ${mod}`)
			.setDescription(`${member} has now been softbanned.`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		const embed2 = new SignalEmbed(interaction)
			.setTitle(`${mod} You were Banned from ${interaction.guild.name}`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		await member.user.send({ embeds: [embed2] }).catch();

		await member.ban({ reason: `Banned by ${interaction.user.tag} | Case #${caseID}` });
		await interaction.guild.bans.fetch();
		await interaction.guild.bans.remove(member.id, 'Softban being Revoked');

		const banObject = {
			guild: interaction.guild.id,
			channel: interaction.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'softban',
				target: member.id,
				moderator: interaction.user.id,
				reason: reason,
				date: new Date(Date.now()).getTime(),
				auditId: await this.sendModLogMessage(interaction, reason, member.id, 'softban'),
			},
		};

		this.client.db.push('global_bans', banObject);
		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, banObject);
		this.client.db.set(`lastcase-ban-${member.id}`, banObject);
		this.client.db.ensure(`sanctions-${member.id}`, []);
		this.client.db.push(`sanctions-${member.id}`, banObject);

		interaction.reply({ ephemeral: false, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'user',
				type: 'USER',
				description: 'User to apply the moderation actions to',
				required: true,
			},
			{
				name: 'reason',
				type: 'STRING',
				description: '(Optional) Reason for the punishment',
				required: false,
			}],
		};
	}
};