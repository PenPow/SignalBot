const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const permissions = require('../../utils/permissions.json');

module.exports = class PermissionsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'permissions',
			usage: 'permissions [user]',
			aliases: ['perms'],
			description: 'Displays all current permissions for the specified user, defaulting to you.',
			type: client.types.INFO,
			examples: ['permissions', 'perms @PenPow', 'permissions 207198455301537793'],
			clientPermissions: ['EMBED_LINKS'],
			//   userPermissions: ['CHANGE_NICKNAME'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		const member = (await this.getMemberFromMention(message, args[0])) || message.guild.members.cache.get(args[0]) || message.member;

		const memberPermissions = member.permissions.toArray();
		const finalPermissions = [];
		for (const permission in permissions) {
			if (memberPermissions.includes(permission)) finalPermissions.push(`+ ${permissions[permission]}`);
			else finalPermissions.push(`- ${permissions[permission]}`);
		}

		const embed = new SignalEmbed(message)
			.setTitle(`${member.displayName}'s Permissions`)
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`\`\`\`diff\n${finalPermissions.join('\n')}\`\`\``);

		message.reply({ embeds: [embed] });
	}

	slashRun(interaction, args) {
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
				type: 'USER',
				description: '(Optional) Shows permission for that user, defaults to you if none is given',
				required: false,
			}],
		};
	}
};