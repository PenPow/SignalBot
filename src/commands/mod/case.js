const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const { success, mod } = require('../../utils/emojis');

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
		if(!args[0]) return this.sendErrorMessage(message, 0, 'Please provide a case ID or use \'latest\'');

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
		const target = await this.client.users.fetch(caseInfo.caseInfo.target);
		const moderator = await message.guild.members.fetch(caseInfo.caseInfo.moderator);

		const embed = new MessageEmbed()
			.setTitle(`Case #${caseID} ${mod}`)
			.setDescription(`**Member**\n\`${target.tag}\`(${caseInfo.caseInfo.target})\n**Action:** \`${message.client.utils.capitalize(caseInfo.caseInfo.type)}\`\n**Moderator**\n\`${moderator.displayName}\`(${caseInfo.caseInfo.moderator})\n**Reason:** ${caseInfo.caseInfo.reason.replace(/`/g, '')}`)
			.setFooter(`Case #${caseID} • ${message.member.displayName}`, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const caseInformation = this.client.db.get(`case-${interaction.guild.id}-${args.get('caseid')?.value}`);
		if(!caseInformation) return this.sendErrorMessage(interaction, 1, 'No Case Found');
		const modLog = interaction.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');

		const sentMessage = await modLog.messages.fetch(caseInformation.caseInfo.auditId);

		if(!sentMessage?.embeds[0]) return this.sendSlashErrorMessage(interaction, 1, 'Failed to find a message to update.');
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

		const embed2 = new MessageEmbed()
			.setTitle(`${success} Updated Reason for Case #${caseID} ${mod}`)
			.setDescription(`Updated the reason for the case to ${args.get('reason')?.value}`)
			.setFooter(`Case #${caseID} • ${interaction.member.displayName}`, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		interaction.reply({ ephemeral: true, embeds: [embed2] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'caseid',
				type: 'INTEGER',
				description: '(Optional) CaseID to edit the reason for',
				required: false,
			}],
		};
	}
};