const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const { success, mod } = require('../../utils/emojis');
const ms = require('ms');

module.exports = class MuteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'mute',
			usage: 'mute <user mention/ID> <time> [reason]',
			description: 'Mutes a user for the specified amount of time.',
			type: client.types.MOD,
			examples: ['mute @PenPow 1w He was mean'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
			userPermissions: ['MANAGE_ROLES', 'MANAGE_MESSAGES'],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}
	async run(message, args) {
		const muteRole = this.client.db.get(`muterole-${message.guild.id}`) || message.guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

		if(!muteRole) return this.sendErrorMessage(message, 1, 'There is currently no mute role set on this server');

		let member;

		try {
			member = await this.getMemberFromMention(message, args[0]) || (await message.guild.members.fetch(args[0]));
		}
		catch(e) {
			// eslint disable-line
		}

		if (!args[0] || !member) return this.sendErrorMessage(message, 0, 'Please mention a user or provide a valid user ID');
		if (member === message.member) return this.sendErrorMessage(message, 0, 'You cannot mute yourself');
		if (member === message.guild.me) return this.sendErrorMessage(message, 0, 'You cannot mute me');
		if (member.roles.highest.position >= message.member.roles.highest.position || !member.manageable) return this.sendErrorMessage(message, 0, 'You cannot mute someone with an equal or higher role');
		if (!args[1]) return this.sendErrorMessage(message, 0, 'Please enter a length of time (1s/m/h/d/w/y)');
		if (member.user.bot) return this.sendErrorMessage(message, 0, 'I cannot punish a bot.');

		let time = ms(args[1]);

		if(Math.sign(time) < 0) parseInt(time *= -1);

		if (typeof time !== 'number') return this.sendErrorMessage(message, 0, 'Please enter a valid length of time (1s/m/h/d/w/y)');
		let reason = args.slice(2).join(' ');
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		if (member.roles.cache.has(muteRole.id)) return this.sendErrorMessage(message, 0, 'Provided member is already muted');

		const approved = await this.client.utils.confirmation(message, `Are you sure you want to mute \`${member.user.tag}\`?`, message.author.id);

		if(!approved) return this.sendErrorMessage(message, 1, 'Cancelled Command (Command Timed Out or Confirmation Declined)');

		try {
			await member.roles.add(muteRole.id);
		}
		catch(e) {
			return this.sendErrorMessage(message, 1, 'Please check the role hierarchy', e.message);
		}

		const caseID = this.client.utils.getCaseNumber(this.client, message.guild);

		const embed = new MessageEmbed()
			.setTitle(`${success} Muted Member ${mod}`)
			.setDescription(`${member} has now been muted for **${ms(time, { long: true })}**.`)
			.addField('Moderator', `<@${message.author.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Time', `\`${ms(time)}\``, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		const embed2 = new MessageEmbed()
			.setTitle(`${mod} You were Muted in ${message.guild.name}`)
			.setDescription(`You are muted for **${ms(time, { long: true })}**.`)
			.addField('Moderator', `<@${message.author.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Time', `\`${ms(time)}\``, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		member.user.send({ embeds: [embed2] }).catch();

		const redisClient = this.client.redis;

		const expireDate = new Date(Date.now()).getTime();

		const muteObject = {
			guild: message.guild.id,
			channel: message.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'mute',
				target: member.id,
				moderator: message.author.id,
				reason: reason,
				expiry: new Date(expireDate + time).getTime(),
				auditId: await this.sendModLogMessage(message, reason, member.id, 'mute'),
			},
		};

		try {
			const redisKey = `mute-${message.guild.id}-${caseID}`;
			redisClient.set(redisKey, 'Muted', 'EX', Math.round(time / 1000));
		}
		catch(e) {
			this.client.logger.error(e.stack);
		}

		this.client.db.push('global_mutes', muteObject);
		this.client.db.set(`case-${message.guild.id}`, caseID);
		this.client.db.set(`case-${message.guild.id}-${caseID}`, muteObject);
		this.client.db.set(`lastcase-mute-${member.id}`, muteObject);

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const muteRole = this.client.db.get(`muterole-${interaction.guild.id}`) || interaction.guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

		if(!muteRole) return this.sendSlashErrorMessage(interaction, 1, 'There is currently no mute role set on this server');

		const member = args.first()?.member;


		if (!member) return this.sendSlashErrorMessage(interaction, 0, 'Please mention a user or provide a valid user ID');
		if (member === interaction.member) return this.sendSlashErrorMessage(interaction, 0, 'You cannot mute yourself');
		if (member === interaction.guild.me) return this.sendSlashErrorMessage(interaction, 0, 'You cannot mute me');
		if (member.roles.highest.position >= interaction.member.roles.highest.position || !member.manageable) return this.sendSlashErrorMessage(interaction, 0, 'You cannot mute someone with an equal or higher role');
		if (!args.get('time').value) return this.sendSlashErrorMessage(interaction, 0, 'Please enter a length of time (1s/m/h/d/w/y)');
		if (member.user.bot) return this.sendSlashErrorMessage(interaction, 0, 'I cannot punish a bot.');

		let time = ms(args.get('time').value);

		if(Math.sign(time) < 0) parseInt(time *= -1);

		if (typeof time !== 'number') return this.sendSlashErrorMessage(interaction, 0, 'Please enter a valid length of time (1s/m/h/d/w/y)');
		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		if (member.roles.cache.has(muteRole.id)) return this.sendSlashErrorMessage(interaction, 0, 'Provided member is already muted');

		try {
			await member.roles.add(muteRole.id);
		}
		catch(e) {
			return this.sendSlashErrorMessage(interaction, 1, 'Please check the role hierarchy', e.message);
		}

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);

		const embed = new MessageEmbed()
			.setTitle(`${success} Muted Member ${mod}`)
			.setDescription(`${member} has now been muted for **${ms(time, { long: true })}**.`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Time', `\`${ms(time)}\``, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		const embed2 = new MessageEmbed()
			.setTitle(`${mod} You were Muted in ${interaction.guild.name}`)
			.setDescription(`You are muted for **${ms(time, { long: true })}**.`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Time', `\`${ms(time)}\``, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		member.user.send({ embeds: [embed2] }).catch();

		const redisClient = this.client.redis;

		const expireDate = new Date(Date.now()).getTime();

		const muteObject = {
			guild: interaction.guild.id,
			channel: interaction.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'mute',
				target: member.id,
				moderator: interaction.user.id,
				reason: reason,
				expiry: new Date(expireDate + time).getTime(),
				auditId: await this.sendSlashModLogMessage(interaction, reason, member.id, 'mute'),
			},
		};

		try {
			const redisKey = `mute-${interaction.guild.id}-${caseID}`;
			redisClient.set(redisKey, 'Muted', 'EX', Math.round(time / 1000));
		}
		catch(e) {
			this.client.logger.error(e.stack);
		}

		this.client.db.push('global_mutes', muteObject);
		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		this.client.db.set(`lastcase-mute-${member.id}`, muteObject);
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, muteObject);

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
				description: 'Length of time (1s/m/h/d/w/y)',
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