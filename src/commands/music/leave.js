const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { undeafened } = require('../../utils/emojis.js');

module.exports = class LeaveCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'leave',
			usage: 'leave',
			aliases: ['stop', 'quit', 'end', 'disconnect', 'dc'],
			description: 'Leaves the Voice Channel (Requires Administrator or for you to be alone with the bot)',
			type: client.types.MUSIC,
			examples: ['leave', 'stop', 'quit', 'end', 'disconnect', 'dc'],
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

		subscription.voiceConnection.destroy();

		this.client.subscriptions.delete(message.guild.id);

		const embed = new SignalEmbed(message)
			.setTitle(`${undeafened} Successfully Left Channel`);
		return message.reply({ embeds: [embed] });
	}

	async slashRun(interaction) {
		const subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!subscription) return this.sendErrorMessage(interaction, 2, 'I am not playing anything in this server');
		if(!interaction.member.voice.channel) return this.sendErrorMessage(interaction, 2, 'You are not in a voice channel');
		if(interaction.member.voice.channel.id !== subscription?.voiceConnection.joinConfig.channelId) return this.sendErrorMessage(interaction, 2, 'You are not in the same voice channel as the bot');
		if(!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.voice.channel.members.size > 2) return this.sendErrorMessage(interaction, 2, 'Too many people in channel. You require \'Administrator\' or be alone with the bot');

		subscription.voiceConnection.destroy();

		this.client.subscriptions.delete(interaction.guild.id);

		const embed = new SignalEmbed(interaction)
			.setTitle(`${undeafened} Successfully Left Channel`);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};