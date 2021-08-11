const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { stripIndent } = require('common-tags');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { info, fun, misc, mod, admin, store } = require('../../utils/emojis');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			usage: 'help <command | all>',
			description: 'Shows the information about the bot or commands.',
			type: client.types.INFO,
			examples: ['help', 'help all', 'help nick', 'help cat'],
			clientPermissions: ['EMBED_LINKS'],

		});
	}

	async run(interaction, args) {
		const all = args?.get('command')?.value || '';

		const embed = new SignalEmbed(interaction);
		const prefix = '/';

		const { INFO, FUN, MISC, MOD, ADMIN, OWNER, TAGS } = interaction.client.types;
		const { capitalize } = interaction.client.utils;

		const command = interaction.client.commands.get(args?.get('command')?.value.toLowerCase());
		if(command && (command.type !== OWNER || interaction.client.isOwner(interaction.user))) {
			embed
				.setTitle(`Command: \`${command.name}\``)
				.setThumbnail(interaction.client.user.displayAvatarURL())
				.setDescription(command.description)
				.addField('Usage', `\`${prefix}${command.usage}\``, true)
				.addField('Type', `\`${capitalize(command.type)}\``, true);

			if (command.examples) embed.addField('Examples', command.examples.map(c => `\`${prefix}${c}\``).join('\n'));
		}
		else if(args?.get('command')?.value && all) {
			return this.sendErrorMessage(interaction, 0, 'Unable to find command, please check provided command');
		}
		else {
			const commands = {};

			for (const type of Object.values(interaction.client.types)) {
				commands[type] = [];
			}

			const emojiMap = {
				[INFO]: `${info} ${capitalize(INFO)}`,
				[FUN]: `${fun} ${capitalize(FUN)}`,
				[MISC]: `${misc} ${capitalize(MISC)}`,
				[TAGS]: `${store} ${capitalize(TAGS)}`,
				[MOD]: `${mod} ${capitalize(MOD)}`,
				[ADMIN]: `${admin} ${capitalize(ADMIN)}`,
			};

			interaction.client.commands.forEach(command_loop => {
				if (command_loop.userPermissions && command_loop.userPermissions.every(p => interaction.member.permissions.has(p)) && !all) commands[command_loop.type].push(`\`${command_loop.name}\``);
				else if(!command_loop.userPermissions || all) commands[command_loop.type].push(`\`${command_loop.name}\``);
			});

			const total = Object.values(commands).reduce((a, b) => a + b.length, 0);
			const size = interaction.client.commands.size;

			embed
				.setTitle('Signal\'s Commands')
				.setDescription(stripIndent`
            **Prefix:** \`${prefix}\`
            **More Information:** \`${prefix}help [command]\`
            ${(!all && size != total) ? `**All Commands:** \`${prefix}help all\`` : ''}
          `)
				.setFooter(
					(!all && size != total) ?
						'Only showing available commands.\n' + interaction.member.displayName : interaction.member.displayName,
					interaction.user.displayAvatarURL({ dynamic: true }),
				)
				.setTimestamp()
				.setThumbnail(interaction.client.user.displayAvatarURL())
				.setColor(interaction.guild.me.displayHexColor);

			for (const type of Object.values(interaction.client.types)) {
				if (type === OWNER && !interaction.client.isOwner(interaction.user)) continue;
				if (commands[type][0]) embed.addField(`**${emojiMap[type]} [${commands[type].length}]**`, commands[type].join(' '));
			}

			embed.addField(
				'**Links**',
				'**[Invite Me](https://discord.com/oauth2/authorize?client_id=789809995478597642&scope=bot&permissions=498330710) | ' +
              '[Support Server](https://discord.gg/BGDyZMdvbw)**',
			);
		}

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'command',
				type: ApplicationCommandOptionType.String,
				description: '(Optional) Get Detailed Information about a command',
				required: false,
			}],
		};
	}
};