const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { promisify } = require('util');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { success, mod } = require('../../utils/emojis');

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
			guldOnly: true,
		});
	}

	async run(interaction, args) {
		const exists = promisify(this.client.redis.exists).bind(this.client.redis);

		let member;
		try {
			if(args.get('caseid')?.value) member = (await interaction.client.users.fetch(this.client.db.get(`case-${interaction.guild.id}-${args.get('caseid')?.value}`)?.caseInfo?.target));
			else member = (await interaction.client.users.fetch(args.get('user')?.value));
		}
		catch(e) {
			// eslint disable-line
		}

		if (!member) return this.sendErrorMessage(interaction, 0, 'Please mention a user, provide a valid user ID, or provide a valid case ID');

		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		if (member.bot) return this.sendErrorMessage(interaction, 0, 'I cannot edit a bot.');

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);
		const oldCaseInfo = this.client.db.get(`lastcase-ban-${member.id}`);

		const embed = new SignalEmbed(interaction)
			.setTitle(`${success} Unbanned Member ${mod}`)
			.setDescription(`${member} has now been unbanned`)
			.addField('Moderator', `<@${interaction.user.id}>`, true)
			.addField('Member', `<@${member.id}>`, true)
			.addField('Reason', reason)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }));

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
				date: new Date(Date.now()).getTime(),
				auditId: await this.sendModLogMessage(interaction, reason, member.id, 'unban'),
			},
		};

		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, muteObject);
		this.client.db.ensure(`sanctions-${member.id}`, []);
		this.client.db.push(`sanctions-${member.id}`, muteObject);

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
				type: ApplicationCommandOptionType.User,
				description: 'UserID to remove the ban for',
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
			}],
		};
	}
};