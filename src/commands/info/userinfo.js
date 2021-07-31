const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const emojis = require('../../utils/emojis.js');
const moment = require('moment');

const flags = {
	DISCORD_EMPLOYEE: `${emojis.discord_employee} \`Discord Employee\``,
	DISCORD_PARTNER: `${emojis.discord_partner} \`Partnered Server Owner\``,
	BUGHUNTER_LEVEL_1: `${emojis.bughunter_level_1} \`Bug Hunter (Level 1)\``,
	BUGHUNTER_LEVEL_2: `${emojis.bughunter_level_2} \`Bug Hunter (Level 2)\``,
	HYPESQUAD_EVENTS: `${emojis.hypesquad_events} \`HypeSquad Events\``,
	HOUSE_BRAVERY: `${emojis.house_bravery} \`House of Bravery\``,
	HOUSE_BRILLIANCE: `${emojis.house_brilliance} \`House of Brilliance\``,
	HOUSE_BALANCE: `${emojis.house_balance} \`House of Balance\``,
	EARLY_SUPPORTER: `${emojis.early_supporter} \`Early Supporter\``,
	TEAM_USER: 'Team User',
	SYSTEM: 'System',
	VERIFIED_BOT: `${emojis.verified_bot} \`Verified Bot\``,
	VERIFIED_DEVELOPER: `${emojis.verified_developer} \`Early Verified Bot Developer\``,
};

module.exports = class UserInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'userinfo',
			aliases: ['user', 'ui', 'whois'],
			usage: 'userinfo [user mention/ID]',
			description: 'Fetches a user\'s information. If no user is given, your own information will be displayed.',
			type: client.types.INFO,
			guilds: ['GLOBAL'],
			examples: ['userinfo @PenPow', 'user', 'ui @Discord', 'whois'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction, args) {
		const member = args?.first()?.member || interaction.member;
		const userFlags = (await member.user.fetchFlags()).toArray();

		let roles = interaction.client.utils.trimArray(member.roles.cache.array().filter(r => !r.name.startsWith('#')));
		roles = interaction.client.utils.removeElement(roles, interaction.guild.roles.everyone)
			.sort((a, b) => b.position - a.position).join(' ');

		const embed = new SignalEmbed(interaction)
			.setTitle(`${member.displayName}'s Information`)
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.addField('User', `\`${member.user.tag}\``, true)
			.addField('Discriminator', `\`#${member.user.discriminator}\``, true)
			.addField('ID', `\`${member.id}\``, true)
			.addField('Bot', `\`${member.user.bot}\``, true)
			.addField('Highest Role', `\`${member.roles.highest.name}\``, true)
			.addField('Joined server on', `\`${moment(member.joinedAt).format('MMM DD YYYY')}\``, true)
			.addField('Joined Discord on', `\`${moment(member.user.createdAt).format('MMM DD YYYY')}\``, true)
			.addField('Roles', roles || '`None`');

		if (userFlags.length > 0) embed.addField('Badges', userFlags.map(flag => flags[flag]).join('\n'));

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'user',
				type: 'USER',
				description: '(Optional) Gets the user\'s information, defaults to you if none is given.',
				required: false,
			}],
		};
	}
};