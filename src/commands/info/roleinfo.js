const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const moment = require('moment');
const permissions = require('../../utils/permissions.json');

module.exports = class RoleInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'roleinfo',
			aliases: ['role', 'ri'],
			usage: 'roleinfo <role mention/ID>',
			description: 'Fetches information about the provided role.',
			type: client.types.INFO,
			guilds: ['GLOBAL'],
			examples: ['roleinfo @owner', 'ri 690664655751872564'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction, args) {
		const role = args.first().role;
		if (!role) return this.sendErrorMessage(interaction, 0, 'Please mention a role or provide a valid role ID');

		const rolePermissions = role.permissions.toArray();
		const finalPermissions = [];
		for (const permission in permissions) {
			if (rolePermissions.includes(permission)) finalPermissions.push(`+ ${permissions[permission]}`);
			else finalPermissions.push(`- ${permissions[permission]}`);
		}

		const position = `\`${interaction.guild.roles.cache.size - role.position}\`/\`${interaction.guild.roles.cache.size}\``;

		const embed = new SignalEmbed(interaction)
			.setTitle('Role Information')
			.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
			.addField('Role', `\`${role.name}\``, true)
			.addField('Role ID', `\`${role.id}\``, true)
			.addField('Position', position, true)
			.addField('Mentionable', `\`${role.mentionable}\``, true)
			.addField('Bot Role', `\`${role.managed}\``, true)
			.addField('Color', `\`${role.hexColor.toUpperCase()}\``, true)
			.addField('Members', `\`${role.members.size}\``, true)
			.addField('Hoisted', `\`${role.hoist}\``, true)
			.addField('Created On', `\`${moment(role.createdAt).format('MMM DD YYYY')}\``, true)
			.addField('Permissions', `\`\`\`diff\n${finalPermissions.join('\n')}\`\`\``);

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'role',
				type: 'ROLE',
				description: 'Info about the role specified',
				required: true,
			}],
		};
	}
};