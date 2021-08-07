const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

module.exports = class ServerIconCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'servericon',
			usage: 'servericon',
			description: 'Displays the server\'s icon.',
			type: client.types.INFO,
			examples: ['servericon'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	run(interaction) {
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