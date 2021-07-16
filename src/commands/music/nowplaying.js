const Command = require('../../structures/Command');
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
		if(!subscription) return message.reply({ content: 'I am not playing anything in this server.' });

		const current =
				subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
					? 'Nothing is currently playing!'
					: `Playing **${(subscription.audioPlayer.state.resource).metadata.title}**`;

		await message.reply({ content: `${current}` });
	}

	async slashRun(interaction) {
		const subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!subscription) return interaction.reply({ content: 'I am not playing anything in this server.', ephemeral: true });

		const current =
				subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
					? 'Nothing is currently playing!'
					: `Playing **${(subscription.audioPlayer.state.resource).metadata.title}**`;

		return interaction.reply({ content: `${current}`, ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};