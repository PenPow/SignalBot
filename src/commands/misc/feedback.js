const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success, unread_pin } = require('../../utils/emojis');
const { oneLine } = require('common-tags');

module.exports = class FeedbackCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'feedback',
			usage: 'feedback <message>',
			aliases: ['fb'],
			description: 'Sends a message to our feedback server',
			type: client.types.MISC,
			examples: ['feedback I really like this bot', 'feedback Could you add a new feature?'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		if (!args[0]) return this.sendErrorMessage(message, 0, 'Please provide a message to send');
		let feedback = message.content.slice(message.content.indexOf(args[0]), message.content.length);

		let feedbackChannel;

		try {
			feedbackChannel = await message.client.channels.fetch('846084994963341353');
		}
		catch(e) {
			this.client.logger.error(`An Error Occured in Fetching Channel ->\n${e}`);
		}

		if (!feedbackChannel) return this.sendErrorMessage(message, 1, 'Unable to find feedback channel');

		const feedbackEmbed = new MessageEmbed()
			.setTitle(`${unread_pin} New Feedback`)
			.setThumbnail(feedbackChannel.guild.iconURL({ dynamic: true }))
			.setDescription(feedback)
			.addField('User', `<@${message.author.id}>`, true)
			.addField('Server', message?.guild?.name || 'Direct Messsage', true)
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		feedbackChannel.send(feedbackEmbed);

		if (feedback.length > 1024) feedback = feedback.slice(0, 1021) + '...';

		const embed = new MessageEmbed()
			.setTitle(`${success} Feedback Sent`)
			.setThumbnail(message.client.user.displayAvatarURL())
			.setDescription(oneLine`
          Successfully sent feedback!
        `)
			.addField('Member', message.member, true)
			.addField('Message', feedback)
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		let feedback = args.first()?.value;

		let feedbackChannel;

		try {
			feedbackChannel = await interaction.client.channels.fetch('846084994963341353');
		}
		catch(e) {
			this.client.logger.error(`An Error Occured in Fetching Channel ->\n${e}`);
		}

		if (!feedbackChannel) return this.sendSlashErrorMessage(interaction, 1, 'Unable to find feedback channel');

		const feedbackEmbed = new MessageEmbed()
			.setTitle(`${unread_pin} New Feedback`)
			.setThumbnail(feedbackChannel.guild.iconURL({ dynamic: true }))
			.setDescription(feedback)
			.addField('User', `<@${interaction.user.id}>`, true)
			.addField('Server', interaction?.guild?.name || 'Direct Messsage', true)
			.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		feedbackChannel.send({ embeds: [feedbackEmbed] });

		if (feedback.length > 1024) feedback = feedback.slice(0, 1021) + '...';

		const embed = new MessageEmbed()
			.setTitle(`${success} Feedback Sent`)
			.setThumbnail(interaction.client.user.displayAvatarURL())
			.setDescription(oneLine`
          Successfully sent feedback!
        `)
			.addField('Message', feedback)
			.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'message',
				type: 'STRING',
				description: 'Message to send to our team',
				required: true,
			}],
		};
	}
};