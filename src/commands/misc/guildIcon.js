const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

module.exports = class GuildIconCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guildicon',
			usage: 'guildicon',
			aliases: ['gicon', 'sicon', 'srvicn', 'servericon'],
			description: 'Shows the current guild icon',
			type: client.types.MISC,
			examples: ['guildicon', 'gicon', 'sicon', 'srvicn', 'servericon'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message) {
		const embed = new SignalEmbed(message)
			.setTitle('Server Icon');

		if(!message.guild.iconURL) embed.setDescription(`${message.guild.name} has no icon`);
		else embed.setImage(message.guild.iconURL({ format: 'png', dynamic: true }));

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction) {
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