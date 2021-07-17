const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { mod } = require('../../utils/emojis');

module.exports = class ReasonCommand extends Command {
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
	async run(message, args) {
		if(!args[0]) args[0] = 'latest';

		let caseID;

		if(args[0].toLowerCase() === 'latest') {
			await message.guild.channels.fetch();
			const modLog = message.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');

			const sentMessage = (await modLog.messages.fetch({ limit: 100 })).filter(m => m.member === message.guild.me &&
			m.embeds[0] &&
			m.embeds[0].type == 'rich' &&
			m.embeds[0].footer &&
			m.embeds[0].footer.text &&
			m.embeds[0].footer.text.startsWith('Case #'),
			).first();
			caseID = sentMessage.embeds[0].footer.text.substring(6);
		}
		else { caseID = args[0]; }

		const caseInfo = this.client.db.get(`case-${message.guild.id}-${caseID}`);
		if(!caseInfo) return this.sendErrorMessage(message, 2, 'No Cases Found');
		const target = await this.client.users.fetch(caseInfo.caseInfo.target);
		const moderator = await message.guild.members.fetch(caseInfo.caseInfo.moderator);

		const embed = new SignalEmbed(message)
			.setTitle(`Case #${caseID} ${mod}`)
			.setDescription(`**Member**\n\`${target.tag}\`(${caseInfo.caseInfo.target})\n**Action:** \`${message.client.utils.capitalize(caseInfo.caseInfo.type)}\`\n**Moderator**\n\`${moderator.displayName}\`(${caseInfo.caseInfo.moderator})\n**Reason:** ${caseInfo.caseInfo.reason.replace(/`/g, '')}`)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }));

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		if(!args.get('caseid')) args.set('caseid', 'latest');

		let caseID;

		if(args.get('caseid').toLowerCase() === 'latest') {
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
		else { caseID = args.get('caseid'); }

		const caseInfo = this.client.db.get(`case-${interaction.guild.id}-${caseID}`);
		if(!caseInfo) return this.sendErrorMessage(interaction, 2, 'No Cases Found');
		const target = await this.client.users.fetch(caseInfo.caseInfo.target);
		const moderator = await interaction.guild.members.fetch(caseInfo.caseInfo.moderator);

		const embed = new SignalEmbed(interaction)
			.setTitle(`Case #${caseID} ${mod}`)
			.setDescription(`**Member**\n\`${target.tag}\`(${caseInfo.caseInfo.target})\n**Action:** \`${interaction.client.utils.capitalize(caseInfo.caseInfo.type)}\`\n**Moderator**\n\`${moderator.displayName}\`(${caseInfo.caseInfo.moderator})\n**Reason:** ${caseInfo.caseInfo.reason.replace(/`/g, '')}`)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }));

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'caseid',
				type: 'INTEGER',
				description: 'CaseID to edit the reason for',
				required: false,
			}],
		};
	}
};
