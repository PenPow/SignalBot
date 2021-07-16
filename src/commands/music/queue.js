const Command = require('../../structures/Command');
const {
	AudioPlayerStatus,
} = require('@discordjs/voice');

module.exports = class QueueCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'queue',
			usage: 'queue',
			aliases: ['q'],
			description: 'Shows the queue for the server',
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

		const queue = subscription.queue
			.slice(0, 5)
			.map((track, index) => `${index + 1}) ${track.title}`)
			.join('\n');

		await message.reply({ content: `${current}\n\n${queue}` });
	}

	async slashRun(interaction) {
		const subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!subscription) return interaction.reply({ content: 'I am not playing anything in this server.', ephemeral: true });

		const current =
				subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
					? 'Nothing is currently playing!'
					: `Playing **${(subscription.audioPlayer.state.resource).metadata.title}**`;

		const queue = subscription.queue
			.slice(0, 5)
			.map((track, index) => `${index + 1}) ${track.title}`)
			.join('\n');

		return interaction.reply({ content: `${current}\n\n${queue}`, ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};