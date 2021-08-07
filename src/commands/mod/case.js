const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { mod } = require('../../utils/emojis');

module.exports = class CaseCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'case',
			usage: 'case <caseID | latest>',
			aliases: ['caseinfo'],
			description: 'Gets the detailed information about a case.',
			type: client.types.MOD,
			examples: ['case 1', 'caseinfo latest'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: [],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}

	async run(interaction, args) {
		let caseID = args.get('caseid')?.value || 'latest';

		if(caseID === 'latest') {
			await interaction.guild.channels.fetch();
			const modLog = interaction.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');

			const sentMessage = (await modLog.messages.fetch({ limit: 100 })).filter(m => m.member === interaction.guild.me &&
			m.embeds[0] &&
			m.embeds[0].type == 'rich' &&
			m.embeds[0].footer &&
			m.embeds[0].footer.text &&
			m.embeds[0].footer.text.startsWith('Case #'),
			).first();
			caseID = sentMessage.embeds[0].footer.text.substring(6);
		}
		else { caseID = args.get('caseid')?.value; }

		const caseInfo = this.client.db.get(`case-${interaction.guild.id}-${caseID}`);
		if(!caseInfo) return this.sendErrorMessage(interaction, 2, 'No Cases Found');
		if(caseInfo.caseInfo.type !== 'slowmode') {
			const target = await this.client.users.fetch(caseInfo.caseInfo.target);
			const moderator = await interaction.guild.members.fetch(caseInfo.caseInfo.moderator);

			const embed = new SignalEmbed(interaction)
				.setTitle(`Case #${caseID} ${mod}`)
				.setDescription(`**Member**\n\`${target.tag}\`(${caseInfo.caseInfo.target})\n**Action:** \`${interaction.client.utils.capitalize(caseInfo.caseInfo.type)}\`\n**Moderator**\n\`${moderator.displayName}\`(${caseInfo.caseInfo.moderator})\n**Reason:** ${caseInfo.caseInfo.reason.replace(/`/g, '')}`)
				.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }));

			interaction.reply({ embeds: [embed], ephemeral: true });
		}
		else {
			const target = caseInfo.caseInfo.target;
			const moderator = await interaction.guild.members.fetch(caseInfo.caseInfo.moderator);

			const embed = new SignalEmbed(interaction)
				.setTitle(`Case #${caseID} ${mod}`)
				.setDescription(`**Channel**\n\`${target}\`(${target})\n**Action:** \`${interaction.client.utils.capitalize(caseInfo.caseInfo.type)}\`\n**Moderator**\n\`${moderator.displayName}\`(${caseInfo.caseInfo.moderator})\n**Reason:** ${caseInfo.caseInfo.reason.replace(/`/g, '')}`)
				.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }));

			interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'caseid',
				type: ApplicationCommandOptionType.Integer,
				description: 'CaseID to edit the reason for',
				required: false,
			}],
		};
	}
};
