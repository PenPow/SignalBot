const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

module.exports = class ServerIconCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'servericon',
			usage: 'servericon',
			aliases: ['icon', 'i'],
			description: 'Displays the server\'s icon.',
			type: client.types.INFO,
			examples: ['servericon', 'icon', 'i'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	slashRun(interaction) {
		const embed = new SignalEmbed(interaction)
			.setTitle(`${interaction.guild.name}'s Icon`)
			.setImage(interaction.guild.iconURL({ dynamic: true, size: 512 }));
		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};