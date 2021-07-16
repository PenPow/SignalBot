const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

module.exports = class AvatarCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'avatar',
			usage: 'avatar [user]',
			aliases: ['profilepic', 'pic', 'av'],
			description: 'Displays a user\'s avatar (or your own, if no user is mentioned).',
			type: client.types.INFO,
			examples: ['avatar', 'profilepic @PenPow', 'pic @PenPow', 'av @PenPow'],
			clientPermissions: ['EMBED_LINKS'],
			//   userPermissions: ['CHANGE_NICKNAME'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		const member = (await this.getUserFromMention(message, args[0])) || message.guild.members.cache.get(args[0]) || message.author;

		const embed = new SignalEmbed(message)
			.setTitle(`${member.username}'s Avatar`)
			.setImage(member.displayAvatarURL({ dynamic: true, size: 512 }));

		message.reply({ embeds: [embed] });
	}

	slashRun(interaction, args) {
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
				type: 'USER',
				description: '(Optional) Gets the user\'s avatar, defaults to you if none is given.',
				required: false,
			}],
		};
	}
};
