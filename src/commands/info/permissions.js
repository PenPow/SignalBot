const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const permissions = require('../../utils/permissions.json');

module.exports = class PermissionsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'permissions',
			usage: 'permissions [user]',
			description: 'Displays all current permissions for the specified user, defaulting to you.',
			type: client.types.INFO,
			examples: ['permissions'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	run(interaction, args) {
		const member = interaction.guild.members.cache.get(args?.first()?.user.id) || interaction.member;

		const memberPermissions = member.permissions.toArray();
		const finalPermissions = [];
		for (const permission in permissions) {
			if (memberPermissions.includes(permission)) finalPermissions.push(`+ ${permissions[permission]}`);
			else finalPermissions.push(`- ${permissions[permission]}`);
		}

		const embed = new SignalEmbed(interaction)
			.setTitle(`${member.displayName}'s Permissions`)
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`\`\`\`diff\n${finalPermissions.join('\n')}\`\`\``);

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'user',
				type: ApplicationCommandOptionType.User,
				description: '(Optional) Shows permission for that user, defaults to you if none is given',
				required: false,
			}],
		};
	}
};