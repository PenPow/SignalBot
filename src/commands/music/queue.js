const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { undeafened } = require('../../utils/emojis.js');
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
			examples: ['queue', 'q'],
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

		const queue = subscription.queue
			.slice(0, 5)
			.map((track, index) => `${index + 1}) ${track.title}`)
			.join('\n');

		const embed = new SignalEmbed(message)
			.setTitle(`${undeafened} Queue`)
			.addField('Currently Playing', current)
			.addField('Queue', queue || 'Nothing In Queue');

		await message.reply({ embeds: [embed] });
	}

	async slashRun(interaction) {
		const subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!subscription) return this.sendSlashErrorMessage(interaction, 2, 'I am not playing anything in the server');

		const current =
				subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
					? 'Nothing is currently playing!'
					: `Playing **${(subscription.audioPlayer.state.resource).metadata.title}**`;

		const queue = subscription.queue
			.slice(0, 5)
			.map((track, index) => `${index + 1}) ${track.title}`)
			.join('\n');

		const embed = new SignalEmbed(interaction)
			.setTitle(`${undeafened} Queue`)
			.addField('Currently Playing', current)
			.addField('Queue', queue || 'Nothing In Queue');

		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};