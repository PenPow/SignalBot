const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const { success, mod } = require('../../utils/emojis');
const ms = require('ms');

module.exports = class BanCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ban',
			usage: 'ban <user mention/ID> [time] [reason]',
			description: 'Bans a user for the specified amount of time (defaults to lifetime)',
			type: client.types.MOD,
			examples: ['ban @PenPow 1w He was mean', 'ban @PenPow 365y Naughty'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
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
		if (member === message.member) return this.sendErrorMessage(message, 0, 'You cannot ban yourself');
		if (member === message.guild.me) return this.sendErrorMessage(message, 0, 'You cannot ban me');
		if (!member.bannable) return this.sendErrorMessage(message, 0, 'Provided member is not bannable');
		if (member.roles.highest.position >= message.member.roles.highest.position || !member.manageable) return this.sendErrorMessage(message, 0, 'You cannot mute someone with an equal or higher role');
		if (member.user.bot) return this.sendErrorMessage(message, 0, 'I cannot punish a bot.');

		let time = ms(args[1]);

		if(!isNaN(time) && Math.sign(time) < 0) parseInt(time *= -1);

		let reason;
		if(!isNaN(time)) reason = args.slice(2).join(' ');
		else reason = args.slice(1).join(' ');
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		const approved = await this.client.utils.confirmation(message, `Are you sure you want to ban \`${member.user.tag}\`?`, message.author.id);

		if(!approved) return this.sendErrorMessage(message, 1, 'Cancelled Command (Command Timed Out or Confirmation Declined)');

		const caseID = this.client.utils.getCaseNumber(this.client, message.guild);

		let msTime = 'no expiration date';
		if(time) msTime = ms(time, { long: true });

		const embed = new MessageEmbed()
			.setTitle(`${success} Banned Member ${mod}`)
			.setDescription(`${member} has now been banned for **${msTime}**.`)
			.addField('Moderator', `<@${message.author.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Time', `\`${msTime === 'no expiration date' ? 'Permanent' : ms(time, { long: false })}\``, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		const embed2 = new MessageEmbed()
			.setTitle(`${mod} You were Banned from ${message.guild.name}`)
			.setDescription(`You were banned for **${msTime}**.`)
			.addField('Moderator', `<@${message.author.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Time', `\`${msTime === 'no expiration date' ? 'Permanent' : ms(time, { long: false })}\``, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		await member.user.send({ embeds: [embed2] }).catch();

		await member.ban({ reason: `Banned by ${message.author.tag} | Case #${caseID}` });

		const redisClient = this.client.redis;

		const expireDate = new Date(Date.now()).getTime();

		const banObject = {
			guild: message.guild.id,
			channel: message.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'ban',
				target: member.id,
				moderator: message.author.id,
				reason: reason,
				expiry: new Date(expireDate + time).getTime(),
				auditId: await this.sendModLogMessage(message, reason, member.id, 'ban'),
			},
		};

		try {
			const redisKey = `ban-${message.guild.id}-${caseID}`;
			if(!isNaN(time)) redisClient.set(redisKey, 'Banned', 'EX', Math.round(time / 1000));
			else redisClient.set(redisKey, 'Banned');
		}
		catch(e) {
			this.client.logger.error(e.stack);
		}

		this.client.db.push('global_bans', banObject);
		this.client.db.set(`case-${message.guild.id}`, caseID);
		this.client.db.set(`case-${message.guild.id}-${caseID}`, banObject);
		this.client.db.set(`lastcase-ban-${member.id}`, banObject);

		message.reply({ embeds: [embed] });

	}

	async slashRun(interaction, args) {
		let member;

		try {
			member = await args.get('user').member;
		}
		catch(e) {
			// eslint disable-line
		}

		if (!member) return this.sendSlashErrorMessage(interaction, 0, 'Please mention a user or provide a valid user ID');
		if (member === interaction.member) return this.sendSlashErrorMessage(interaction, 0, 'You cannot ban yourself');
		if (member === interaction.guild.me) return this.sendSlashErrorMessage(interaction, 0, 'You cannot ban me');
		if (!member.bannable) return this.sendSlashErrorMessage(interaction, 0, 'Provided member is not bannable');
		if (member.roles.highest.position >= interaction.member.roles.highest.position || !member.manageable) return this.sendSlashErrorMessage(interaction, 0, 'You cannot ban someone with an equal or higher role');
		if (member.user.bot) return this.sendSlashErrorMessage(interaction, 0, 'I cannot punish a bot.');
		let time = ms(args.get('time')?.value);

		if(!isNaN(time) && Math.sign(time) < 0) parseInt(time *= -1);

		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);

		let msTime = 'no expiration date';
		if(time) msTime = ms(time, { long: true });

		const embed = new MessageEmbed()
			.setTitle(`${success} Banned Member ${mod}`)
			.setDescription(`${member} has now been banned for **${msTime}**.`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Time', `\`${msTime === 'no expiration date' ? 'Permanent' : ms(time, { long: false })}\``, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		const embed2 = new MessageEmbed()
			.setTitle(`${mod} You were Banned from ${interaction.guild.name}`)
			.setDescription(`You were banned for **${msTime}**.`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Time', `\`${msTime === 'no expiration date' ? 'Permanent' : ms(time, { long: false })}\``, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		await member.user.send({ embeds: [embed2] }).catch();

		await member.ban({ reason: `Banned by ${interaction.user.tag} | Case #${caseID}` });

		const redisClient = this.client.redis;

		const expireDate = new Date(Date.now()).getTime();

		const banObject = {
			guild: interaction.guild.id,
			channel: interaction.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'ban',
				target: member.id,
				moderator: interaction.user.id,
				reason: reason,
				expiry: new Date(expireDate + time).getTime(),
				auditId: await this.sendSlashModLogMessage(interaction, reason, member.id, 'ban'),
			},
		};

		try {
			const redisKey = `ban-${interaction.guild.id}-${caseID}`;
			if(!isNaN(time)) redisClient.set(redisKey, 'Banned', 'EX', Math.round(time / 1000));
			else redisClient.set(redisKey, 'Banned');
		}
		catch(e) {
			this.client.logger.error(e.stack);
		}

		this.client.db.push('global_bans', banObject);
		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, banObject);
		this.client.db.set(`lastcase-ban-${member.id}`, banObject);

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
				name: 'time',
				type: 'STRING',
				description: '(Optional) Length of time (1s/m/h/d/w/y)',
				required: false,
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