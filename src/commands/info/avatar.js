const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class AvatarCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'avatar',
			usage: 'avatar [user]',
			description: 'Displays a user\'s avatar (or your own, if no user is mentioned).',
			type: client.types.INFO,
			examples: ['avatar'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	run(interaction, args) {
		const member = args?.first()?.member || interaction.member;

		const embed = new SignalEmbed(interaction)
			.setTitle(`${member.displayName}'s Avatar`)
			.setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }));

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'user',
				type: ApplicationCommandOptionType.User,
				description: '(Optional) Gets the user\'s avatar, defaults to you if none is given.',
				required: false,
			}],
		};
	}
};
