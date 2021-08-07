const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

module.exports = class GuildIconCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guildicon',
			usage: 'guildicon',
			description: 'Shows the current guild icon',
			type: client.types.MISC,
			examples: ['guildicon'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction) {
		const embed = new SignalEmbed(interaction)
			.setTitle('Server Icon');

		if(!interaction.guild.iconURL) embed.setDescription(`${interaction.guild.name} has no icon`);
		else embed.setImage(interaction.guild.iconURL({ format: 'png', dynamic: true }));

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};