const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { oneLine } = require('common-tags');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { success, info2 } = require('../../utils/emojis');

module.exports = class BugReportCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reportbug',
			usage: 'reportbug <message>',
			aliases: ['bugreport', 'report', 'bug', 'rb', 'br'],
			description: 'Sends a message to our bug report server, include as much information as possible.',
			type: client.types.MISC,
			examples: ['reportbug The bot doesnt work', 'bugreport it broke', 'report it went offline', 'bug it didnt run command correctly', 'rb the profile was broken', 'br prefix didnt change'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async run(interaction, args) {
		let feedback = args.first()?.value;

		let feedbackChannel;

		try {
			feedbackChannel = await interaction.client.channels.fetch('846084994963341353');
		}
		catch(e) {
			this.client.logger.error(`An Error Occured in Fetching Channel ->\n${e}`);
		}

		if (!feedbackChannel) return this.sendErrorMessage(interaction, 1, 'Unable to find bug report channel');

		const feedbackEmbed = new SignalEmbed(interaction)
			.setTitle(`${info2} Bug Report`)
			.setThumbnail(feedbackChannel.guild.iconURL({ dynamic: true }))
			.setDescription(feedback)
			.addField('User', `<@${interaction.user.id}>`, true)
			.addField('Server', interaction?.guild?.name || 'Direct Messsage', true);

		feedbackChannel.send({ embeds: [feedbackEmbed] });

		if (feedback.length > 1024) feedback = feedback.slice(0, 1021) + '...';

		const embed = new SignalEmbed(interaction)
			.setTitle(`${success} Bug Report Sent`)
			.setThumbnail(interaction.client.user.displayAvatarURL())
			.setDescription(oneLine`
          Successfully sent bug report!
        `)
			.addField('Message', feedback);

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'message',
				type: ApplicationCommandOptionType.String,
				description: 'Message to send to our team',
				required: true,
			}],
		};
	}
};