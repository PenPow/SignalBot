const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { mod } = require('../../utils/emojis');

module.exports = class SanctionsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'sanctions',
			usage: 'sanctions <member>',
			aliases: ['history'],
			description: 'Shows the history for a user',
			type: client.types.MOD,
			examples: ['sanctions @PenPow', 'history PenPow'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: [],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}
	async run(message, args) {
		let member;

		try {
			member = await this.getMemberFromMention(message, args[0]) || (await message.guild.members.fetch(args[0])) || message.member;
		}
		catch(e) {
			// eslint disable-line
		}

		if (!args[0] || !member) return this.sendErrorMessage(message, 0, 'Please mention a user or provide a valid user ID');

		const embed = new SignalEmbed(message)
			.setTitle(`${mod} History for ${member.displayName}`);

		const history = this.client.db.get(`sanctions-${member.id}`) || [];

		for(let i = history.length - 1; i >= 0; i--) {
			if(i === history.length - 10) {
				embed.setDescription(`We are only able to show the 9 most recent cases here, out of a total of ${history.length}`);
				break;
			}
			embed.addField(`${this.client.utils.capitalize(history[i].caseInfo.type)} | Case #${history[i].caseInfo.caseID}`, `***Reason***\n\`${history[i].caseInfo.reason.replace(/`/g, '')}\`\n***Date***\n<t:${(history[i].caseInfo.date / 1000).toFixed(0)}:F>\n***Moderator***\n<@${history[i].caseInfo.moderator}>`, true);
		}

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const member = args.get('member')?.member;

		const embed = new SignalEmbed(interaction)
			.setTitle(`${mod} History for ${member.displayName}`);

		const history = this.client.db.get(`sanctions-${member.id}`) || [];

		for(let i = history.length - 1; i >= 0; i--) {
			if(i === history.length - 10) {
				embed.setDescription(`We are only able to show the 9 most recent cases here, out of a total of ${history.length}`);
				break;
			}
			embed.addField(`${this.client.utils.capitalize(history[i].caseInfo.type)} | Case #${history[i].caseInfo.caseID}`, `***Reason***\n\`${history[i].caseInfo.reason.replace(/`/g, '')}\`\n***Date***\n<t:${(history[i].caseInfo.date / 1000).toFixed(0)}:F>\n***Moderator***\n<@${history[i].caseInfo.moderator}>`, true);
		}

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'member',
				type: 'USER',
				description: 'Member to get the case history for',
				required: true,
			}],
		};
	}
};
