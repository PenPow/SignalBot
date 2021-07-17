const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

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
		if(!subscription) return this.sendErrorMessage(message, 2, 'I am not playing anything in this server');
		if(!message.member.voice.channel) return this.sendErrorMessage(message, 2, 'You are not in a voice channel');
		if(message.member.voice.channel.id !== subscription?.voiceConnection.joinConfig.channelId) return this.sendErrorMessage(message, 2, 'You are not in the same voice channel as the bot');
		if(!message.member.permissions.has('ADMINISTRATOR') && message.member.voice.channel.members.size > 2) return this.sendErrorMessage(message, 2, 'Too many people in channel. You require \'Administrator\' or be alone with the bot');

		const songSkipped = subscription.audioPlayer.state.resource.metadata.title;
		subscription.audioPlayer.stop();

		const embed = new SignalEmbed(message)
			.setTitle(`:arrow_forward: Skipping ${songSkipped}`);

		return message.reply({ embeds: [embed] });
	}

	async slashRun(interaction) {
		const subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!subscription) return this.sendSlashErrorMessage(interaction, 2, 'I am not playing anything in this server');
		if(!interaction.member.voice.channel) return this.sendSlashErrorMessage(interaction, 2, 'You are not in a voice channel');
		if(interaction.member.voice.channel.id !== subscription?.voiceConnection.joinConfig.channelId) return this.sendSlashErrorMessage(interaction, 2, 'You are not in the same voice channel as the bot');
		if(!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.voice.channel.members.size > 2) return this.sendSlashErrorMessage(interaction, 2, 'Too many people in channel. You require \'Administrator\' or be alone with the bot');

		const songSkipped = subscription.audioPlayer.state.resource.metadata.title;
		subscription.audioPlayer.stop();

		const embed = new SignalEmbed(interaction)
			.setTitle(`:arrow_forward: Skipping ${songSkipped}`);

		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};