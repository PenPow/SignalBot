const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
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
		if (member === message.member) return this.sendErrorMessage(message, 0, 'You cannot kick yourself');
		if (member === message.guild.me) return this.sendErrorMessage(message, 0, 'You cannot kick me');
		if (!member.kickable) return this.sendErrorMessage(message, 0, 'Provided member is not kickable');
		if (member.roles.highest.position >= message.member.roles.highest.position || !member.manageable) return this.sendErrorMessage(message, 0, 'You cannot kick someone with an equal or higher role');
		if (member.user.bot) return this.sendErrorMessage(message, 0, 'I cannot punish a bot.');

		let reason = args.slice(1).join(' ');
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		const approved = await this.client.utils.confirmation(message, `Are you sure you want to kick \`${member.user.tag}\`?`, message.author.id);

		if(!approved) return this.sendErrorMessage(message, 1, 'Cancelled Command (Command Timed Out or Confirmation Declined)');

		const caseID = this.client.utils.getCaseNumber(this.client, message.guild);

		const embed = new MessageEmbed()
			.setTitle(`${success} Kicked Member ${mod}`)
			.setDescription(`${member} has now been kicked.`)
			.addField('Moderator', `<@${message.author.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		const embed2 = new MessageEmbed()
			.setTitle(`${mod} You were Kicked from ${message.guild.name}`)
			.addField('Moderator', `<@${message.author.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		await member.user.send({ embeds: [embed2] }).catch();

		await member.kick({ reason: `Kicked by ${message.author.tag} | Case #${caseID}` });

		const kickObject = {
			guild: message.guild.id,
			channel: message.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'kick',
				target: member.id,
				moderator: message.author.id,
				reason: reason,
				auditId: await this.sendModLogMessage(message, reason, member.id, 'kick'),
			},
		};

		this.client.db.set(`case-${message.guild.id}`, caseID);
		this.client.db.set(`case-${message.guild.id}-${caseID}`, kickObject);

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

		if (!member) return this.sendSlashErrorMessage(interaction, 0, 'Please provide a user');
		if (member === interaction.member) return this.sendSlashErrorMessage(interaction, 0, 'You cannot kick yourself');
		if (member === interaction.guild.me) return this.sendSlashErrorMessage(interaction, 0, 'You cannot kick me');
		if (!member.kickable) return this.sendSlashErrorMessage(interaction, 0, 'Provided member is not kickable');
		if (member.roles.highest.position >= interaction.member.roles.highest.position || !member.manageable) return this.sendSlashErrorMessage(interaction, 0, 'You cannot kick someone with an equal or higher role');
		if (member.user.bot) return this.sendSlashErrorMessage(interaction, 0, 'I cannot punish a bot.');

		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);

		const embed = new MessageEmbed()
			.setTitle(`${success} Kicked Member ${mod}`)
			.setDescription(`${member} has now been kicked.`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		const embed2 = new MessageEmbed()
			.setTitle(`${mod} You were Kicked from ${interaction.guild.name}`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		await member.user.send({ embeds: [embed2] }).catch();

		await member.kick({ reason: `Kicked by ${interaction.user.tag} | Case #${caseID}` });

		const kickObject = {
			guild: interaction.guild.id,
			channel: interaction.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'kick',
				target: member.id,
				moderator: interaction.user.id,
				reason: reason,
				auditId: await this.sendSlashModLogMessage(interaction, reason, member.id, 'kick'),
			},
		};

		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, kickObject);

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