const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { undeafened } = require('../../utils/emojis.js');
const {
	AudioPlayerStatus,
} = require('@discordjs/voice');

module.exports = class NowPlayingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'nowplaying',
			usage: 'nowplaying',
			aliases: ['np'],
			description: 'Shows the currently playing song',
			type: client.types.MUSIC,
			examples: ['queue'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}
	async run(message) {
		const subscription = this.client.subscriptions.get(message.guild.id);
		if(!subscription) return this.sendErrorMessage(message, 2, 'I am not playing anything in the server');

		const current =
				subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
					? 'Nothing is currently playing!'
					: `Playing **${(subscription.audioPlayer.state.resource).metadata.title}**`;

		const embed = new SignalEmbed(message)
			.setTitle(`${undeafened} Now Playing`)
			.setDescription(current);

		await message.reply({ embeds: [embed] });
	}

	async slashRun(interaction) {
		const subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!subscription) return this.sendErrorMessage(interaction, 2, 'I am not playing anything in the server');

		const current =
				subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
					? 'Nothing is currently playing!'
					: `Playing **${(subscription.audioPlayer.state.resource).metadata.title}**`;


		const embed = new SignalEmbed(interaction)
			.setTitle(`${undeafened} Now Playing`)
			.setDescription(current);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};