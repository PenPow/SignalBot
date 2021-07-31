const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { success, mod } = require('../../utils/emojis');

module.exports = class ReasonCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reason',
			usage: 'reason <caseID | latest> <reason>',
			description: 'Edits the reason for the case',
			type: client.types.MOD,
			examples: ['ban @PenPow 1w He was mean', 'ban @PenPow 365y Naughty'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['ADMINISTRATOR'],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}

	async slashRun(interaction, args) {
		const caseInformation = this.client.db.get(`case-${interaction.guild.id}-${args.get('caseid')?.value}`);
		if(!caseInformation) return this.sendErrorMessage(interaction, 1, 'No Case Found');
		const modLog = interaction.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');

		const sentMessage = await modLog.messages.fetch(caseInformation.caseInfo.auditId);

		if(!sentMessage?.embeds[0]) return this.sendErrorMessage(interaction, 1, 'Failed to find a message to update.');
		const caseID = sentMessage.embeds[0].footer.text.substring(6);

		const descriptionArray = sentMessage.embeds[0].description.split('\n');
		descriptionArray[descriptionArray.length - 1] = `**Reason:** ${args.get('reason')?.value}`;

		const finalArray = descriptionArray.join('\n');
		const embed = sentMessage.embeds[0];

		embed.description = finalArray;

		sentMessage.edit({ embeds: [embed] });

		const caseInfo = this.client.db.get(`case-${interaction.guild.id}-${caseID}`);
		caseInfo.caseInfo.reason = args.get('reason')?.value;
		this.client.db.set(`case-${interaction.guild.id}-${caseID}`, caseInfo);

		const embed2 = new SignalEmbed(interaction)
			.setTitle(`${success} Updated Reason for Case #${caseID} ${mod}`)
			.setDescription(`Updated the reason for the case to ${args.get('reason')?.value}`)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }));

		interaction.reply({ ephemeral: true, embeds: [embed2] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'caseid',
				type: 'INTEGER',
				description: 'CaseID to edit the reason for',
				required: true,
			},
			{
				name: 'reason',
				type: 'STRING',
				description: 'Reason to replace the old one',
				required: true,
			}],
		};
	}
};