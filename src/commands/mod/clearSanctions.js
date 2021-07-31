const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { mod } = require('../../utils/emojis');

module.exports = class ClearSanctionsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'clearsanctions',
			usage: 'clearsanctions <member>',
			aliases: ['clearhistory'],
			description: 'Clears the specified user\'s moderation history.',
			type: client.types.MOD,
			examples: ['clearsanctions @PenPow', 'clearhistory PenPow'],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['ADMINISTRATOR'],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}

	async slashRun(interaction, args) {
		const member = args.get('member')?.member;

		const embed = new SignalEmbed(interaction)
			.setTitle(`${mod} Cleared History for ${member.displayName}`);

		this.client.db.set(`sanctions-${member.id}`, []);

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
