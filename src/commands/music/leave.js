const Command = require('../../structures/Command');

module.exports = class LeaveCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'leave',
			usage: 'leave',
			description: 'Leaves the Voice Channel (Requires Administrator or for you to be alone with the bot)',
			type: client.types.MUSIC,
			examples: ['leave'],
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

		subscription.voiceConnection.destroy();

		this.client.subscriptions.delete(message.guild.id);
		return message.reply({ content: 'Successfully Left Channel' });
	}

	async slashRun(interaction) {
		const subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!interaction.member.voice.channel) return interaction.reply({ content: 'You are not currently in a voice channel.', ephemeral: true });
		if(interaction.member.voice.channel.id !== subscription.voiceConnection.joinConfig.channelId) return interaction.reply({ content: 'You are not in the same voice channel as the bot', ephemeral: true });
		if(!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.voice.channel.members.size > 2) return interaction.reply({ content: 'Too many people in channel. You require \'Administrator\' or be alone with the bot', ephemeral: true });
		if(!subscription) return interaction.reply({ content: 'I am not playing anything in this server.', ephemeral: true });

		subscription.voiceConnection.destroy();

		this.client.subscriptions.delete(interaction.guild.id);

		return interaction.reply({ content: 'Successfully Left Channel', ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};