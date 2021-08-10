const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const ms = require('ms');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { mod } = require('../../utils/emojis');

module.exports = class SlowmodeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'slowmode',
			usage: 'slowmode <time> [reason]',
			description: 'Sets the slowmode for a channel',
			type: client.types.MOD,
			examples: ['slowmode 10s', 'slowmode 10m'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_MESSAGES'],
			guildOnly: true,
		});
	}

	async run(interaction, args) {
		await interaction.deferReply();

		const time = ms(args.get('time')?.value);
		if(isNaN(time)) return this.sendErrorMessage(interaction, 0, 'Please specify a valid time. (ex. 10m, 10s, 1h)');
		if(interaction.channel.type !== 'GUILD_TEXT') return this.sendErrorMessage(interaction, 0, 'Due to discord restrictions, we can only adjust the rate limit in guild text channels.');
		const embed = new SignalEmbed(interaction)
			.setTitle(`${mod} Slowmode Set`)
			.setDescription(`Set the slowmode to ${ms(time, { long: true })}`);

		interaction.channel.setRateLimitPerUser(Math.round(time / 1000), `Modified by ${interaction.user.id}`);

		let reason = args.get('reason')?.value;
		if (!reason) reason = '`No Reason Provided`';
		if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

		const caseID = this.client.utils.getCaseNumber(this.client, interaction.guild);

		let reference = this.client.db.get(`case-${interaction.guild.id}-${args.get('reference')?.value.replace('#', '')}`);

		if(!reference) {reference = null;}

		const modLog = interaction.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');
		const sentMessage = await modLog.messages.fetch(reference?.caseInfo?.auditId).catch();

		reference = { caseId: reference?.caseInfo?.caseID, url: sentMessage?.url };
		if(!sentMessage && !reference) reference = null;

		const dbObject = {
			guild: interaction.guild.id,
			channel: interaction.channel.id,
			caseInfo: {
				caseID: caseID,
				type: 'slowmode',
				target: interaction.channel.id,
				moderator: interaction.user.id,
				reason: reason,
				date: new Date(Date.now()).getTime(),
				reference: reference,
				auditId: await this.sendModLogMessage(interaction, reason, interaction.channel.id, 'slowmode', caseID, null, reference),
			},
		};

		this.client.db.set(`case-${interaction.guild.id}`, caseID);
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, dbObject);

		interaction.editReply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'time',
				type: ApplicationCommandOptionType.String,
				description: 'Length of time (1s/m/h/d/w/y)',
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
