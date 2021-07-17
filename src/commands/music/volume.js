const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { undeafened } = require('../../utils/emojis.js');

module.exports = class VolumeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'volume',
			usage: 'volume',
			description: 'Adjusts the volume, from 0 to 100% (Requires Administrator or for you to be alone with the bot)',
			type: client.types.MUSIC,
			examples: ['volume'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}
	async run(message, args) {
		const subscription = this.client.subscriptions.get(message.guild.id);
		if(!subscription) return this.sendErrorMessage(message, 2, 'I am not playing anything in this server');
		if(!message.member.voice.channel) return this.sendErrorMessage(message, 2, 'You are not in a voice channel');
		if(message.member.voice.channel.id !== subscription?.voiceConnection.joinConfig.channelId) return this.sendErrorMessage(message, 2, 'You are not in the same voice channel as the bot');
		if(!message.member.permissions.has('ADMINISTRATOR') && message.member.voice.channel.members.size > 2) return this.sendErrorMessage(message, 2, 'Too many people in channel. You require \'Administrator\' or be alone with the bot');
		if(parseInt(args[0]) > 100 || parseInt(args[0]) < 0 || isNaN(parseInt(args[0]))) return this.sendErrorMessage(message, 0, 'Please specify a number between 1-100 for the volume');
		subscription.audioPlayer.state.resource.volume.setVolume(parseInt(args[0]) / 100);

		const embed = new SignalEmbed(message)
			.setTitle(`${undeafened} Changed Volume`)
			.setDescription(`Successfully changed volume to ${args[0]}%`);

		return message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const subscription = this.client.subscriptions.get(interaction.guild.id);
		if(!subscription) return this.sendErrorMessage(interaction, 2, 'I am not playing anything in this server');
		if(!interaction.member.voice.channel) return this.sendErrorMessage(interaction, 2, 'You are not in a voice channel');
		if(interaction.member.voice.channel.id !== subscription?.voiceConnection.joinConfig.channelId) return this.sendErrorMessage(interaction, 2, 'You are not in the same voice channel as the bot');
		if(!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.voice.channel.members.size > 2) return this.sendErrorMessage(interaction, 2, 'Too many people in channel. You require \'Administrator\' or be alone with the bot');
		if(parseInt(args[0]) > 100 || parseInt(args[0]) < 0 || isNaN(parseInt(args[0]))) return this.sendErrorMessage(interaction, 0, 'Please specify a number between 1-100 for the volume');
		subscription.audioPlayer.state.resource.volume.setVolume(parseInt(args[0]) / 100);

		const embed = new SignalEmbed(interaction)
			.setTitle(`${undeafened} Changed Volume`)
			.setDescription(`Successfully changed volume to ${args.get('volume')?.value}%`);

		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'volume',
				type: 'INTEGER',
				description: 'Volume to set the song to (between 1 and 100)',
				required: true,
			}],
		};
	}
};