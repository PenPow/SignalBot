const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
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
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}
	async run(message, args) {
		let member;

		try {
			member = await this.getMemberFromMention(message, args[0]) || (await message.guild.members.fetch(args[0]));
		}
		catch(e) {
			// eslint disable-line
		}

		if (!args[0] || !member) return this.sendErrorMessage(message, 0, 'Please mention a user or provide a valid user ID');
		if (member === message.member) return this.sendErrorMessage(message, 0, 'You cannot warn yourself');
		if (member === message.guild.me) return this.sendErrorMessage(message, 0, 'You cannot warn me');
		if (!member.kickable) return this.sendErrorMessage(message, 0, 'Provided member is not warnable');
		if (member.roles.highest.position >= message.member.roles.highest.position || !member.manageable) return this.sendErrorMessage(message, 0, 'You cannot warn someone with an equal or higher role');
		if (member.user.bot) return this.sendErrorMessage(message, 0, 'I cannot punish a bot.');

		let reason = args.slice(1).join(' ');
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		const approved = await this.client.utils.confirmation(message, `Are you sure you want to warn \`${member.user.tag}\`?`, message.author.id);

		if(!approved) return this.sendErrorMessage(message, 1, 'Cancelled Command (Command Timed Out or Confirmation Declined)');

		const caseID = this.client.utils.getCaseNumber(this.client, message.guild);

		const embed = new SignalEmbed(message)
			.setTitle(`${success} Warned Member ${mod}`)
			.setDescription(`${member} has now been warned.`)
			.addField('Moderator', `<@${message.author.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }));

		const embed2 = new SignalEmbed(message)
			.setTitle(`${mod} You were warned in ${message.guild.name}`)
			.addField('Moderator', `<@${message.author.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }));

		await member.user.send({ embeds: [embed2] }).catch();

		const warnObject = {
			guild: message.guild.id,
			channel: message.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'warn',
				date: new Date(Date.now()).getTime(),
				target: member.id,
				moderator: message.author.id,
				reason: reason,
				auditId: await this.sendModLogMessage(message, reason, member.id, 'warn'),
			},
		};

		this.client.db.set(`case-${message.guild.id}`, caseID);
		this.client.db.set(`case-${message.guild.id}-${caseID}`, warnObject);
		this.client.db.ensure(`sanctions-${member.id}`, []);
		this.client.db.push(`sanctions-${member.id}`, warnObject);

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
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
				auditId: await this.sendModLogMessage(interaction, reason, member.id, 'warn'),
			},
		};

		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, warnObject);
		this.client.db.ensure(`sanctions-${member.id}`, []);
		this.client.db.push(`sanctions-${member.id}`, warnObject);

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