const Command = require('../../structures/Command');

module.exports = class VolumeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'volume',
			usage: 'volume',
			description: 'Adjusts the volume for the currently playing resource, from 0 to 100% volume (Requires Administrator or for you to be alone with the bot)',
			type: client.types.MUSIC,
			examples: ['volume'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}
	async run(message, args) {
		const subscription = this.client.subscriptions.get(message.guild.id);
		if(!message.member.voice.channel) return message.reply({ content: 'You are not currently in a voice channel.' });
		if(message.member.voice.channel.id !== subscription.voiceConnection.joinConfig.channelId) return message.reply({ content: 'You are not in the same voice channel as the bot' });
		if(!message.member.permissions.has('ADMINISTRATOR') && message.member.voice.channel.members.size > 2) return message.reply({ content: 'Too many people in channel. You require \'Administrator\' or be alone with the bot' });
		if(!subscription) return message.reply({ content: 'I am not playing anything in this server.' });

		if(parseInt(args[0]) > 100 || parseInt(args[0]) < 0) return message.reply({ content: 'Out of Range' });

		subscription.audioPlayer.state.resource.volume.setVolume(parseInt(args[0]) / 100);

		return message.reply({ content: 'Successfully Changed Volume' });
	}

	async slashRun(interaction) {
		const subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!interaction.member.voice.channel) return interaction.reply({ content: 'You are not currently in a voice channel.', ephemeral: true });
		if(interaction.member.voice.channel.id !== subscription.voiceConnection.joinConfig.channelId) return interaction.reply({ content: 'You are not in the same voice channel as the bot', ephemeral: true });
		if(!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.voice.channel.members.size > 2) return interaction.reply({ content: 'Too many people in channel. You require \'Administrator\' or be alone with the bot', ephemeral: true });
		if(!subscription) return interaction.reply({ content: 'I am not playing anything in this server.', ephemeral: true });

		subscription.audioPlayer.pause();

		return interaction.reply({ content: 'Successfully Paused Song', ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};