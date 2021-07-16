const Command = require('../../structures/Command');

module.exports = class SkipCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'skip',
			usage: 'skip',
			description: 'Skips the current song (Requires Administrator or for you to be alone with the bot)',
			type: client.types.MUSIC,
			examples: ['skip'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}
	async run(message) {
		const subscription = this.client.subscriptions.get(message.guild.id);
		if(!message.member.voice.channel) return message.reply({ content: 'You are not currently in a voice channel.' });
		if(message.member.voice.channel.id !== subscription.voiceConnection.joinConfig.channelId) return message.reply({ content: 'You are not in the same voice channel as the bot' });
		if(!message.member.permissions.has('ADMINISTRATOR') && message.member.voice.channel.members.size > 2) return message.reply({ content: 'Too many people in channel. You require \'Administrator\' or be alone with the bot' });
		if(!subscription) return message.reply({ content: 'I am not playing anything in this server.' });

		const songSkipped = subscription.audioPlayer._state.resource.metadata.title;
		subscription.audioPlayer.stop();

		return message.reply({ content: `Skipped \`${songSkipped}\`` });
	}

	async slashRun(interaction) {
		const subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!interaction.member.voice.channel) return interaction.reply({ content: 'You are not currently in a voice channel.', ephemeral: true });
		if(interaction.member.voice.channel.id !== subscription.voiceConnection.joinConfig.channelId) return interaction.reply({ content: 'You are not in the same voice channel as the bot', ephemeral: true });
		if(!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.voice.channel.members.size > 2) return interaction.reply({ content: 'Too many people in channel. You require \'Administrator\' or be alone with the bot', ephemeral: true });
		if(!subscription) return interaction.reply({ content: 'I am not playing anything in this server.', ephemeral: true });

		const songSkipped = subscription.audioPlayer._state.resource.metadata.title;
		subscription.audioPlayer.stop();

		return interaction.reply({ content: `Skipped \`${songSkipped}\``, ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};