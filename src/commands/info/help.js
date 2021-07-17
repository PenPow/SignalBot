const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { stripIndent } = require('common-tags');
const { info, fun, misc, mod, admin, owner } = require('../../utils/emojis');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			usage: 'help <command | all>',
			aliases: ['commands', 'command', 'h'],
			description: 'Shows the information about the bot or commands.',
			type: client.types.INFO,
			examples: ['help', 'help all', 'help nick', 'help cat'],
			clientPermissions: ['EMBED_LINKS'],
			//   userPermissions: ['CHANGE_NICKNAME'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		if(!args[0]) args[0] = 'all';

		const all = (args[0] === 'all') ? args[0] : '';
		const embed = new SignalEmbed(message);
		const prefix = message.client.db.get(`${message.guild.id}_prefix`);

		const { INFO, FUN, MISC, MOD, ADMIN, OWNER, MUSIC } = message.client.types;
		const { capitalize } = message.client.utils;

		const command = message.client.commands.get(args[0].toLowerCase()) || message.client.aliases.get(args[0].toLowerCase());
		if(command && (command.type !== OWNER || message.client.isOwner(message.author))) {
			embed
				.setTitle(`Command: \`${command.name}\``)
				.setThumbnail(message.client.user.displayAvatarURL())
				.setDescription(command.description)
				.addField('Usage', `\`${prefix}${command.usage}\``, true)
				.addField('Type', `\`${capitalize(command.type)}\``, true);

			if (command.aliases) embed.addField('Aliases', command.aliases.map(c => `\`${c}\``).join(' '));
			if (command.examples) embed.addField('Examples', command.examples.map(c => `\`${prefix}${c}\``).join('\n'));
		}
		else if(args.length > 0 && !all) {
			return this.sendErrorMessage(message, 0, 'Unable to find command, please check provided command');
		}
		else {
			const commands = {};

			for (const type of Object.values(message.client.types)) {
				commands[type] = [];
			}

			const emojiMap = {
				[INFO]: `${info} ${capitalize(INFO)}`,
				[FUN]: `${fun} ${capitalize(FUN)}`,
				[MUSIC]: `:musical_note: ${capitalize(MUSIC)}`,
				[MISC]: `${misc} ${capitalize(MISC)}`,
				[MOD]: `${mod} ${capitalize(MOD)}`,
				[ADMIN]: `${admin} ${capitalize(ADMIN)}`,
				[OWNER]: `${owner} ${capitalize(OWNER)}`,
			};

			message.client.commands.forEach(command_loop => {
				if (command_loop.userPermissions && command_loop.userPermissions.every(p => message.member.permissions.has(p)) && !all) commands[command_loop.type].push(`\`${command_loop.name}\``);
				else if(!command_loop.userPermissions || all) commands[command_loop.type].push(`\`${command_loop.name}\``);
			});

			const total = Object.values(commands).reduce((a, b) => a + b.length, 0) - commands[OWNER].length;
			const size = message.client.commands.size - commands[OWNER].length;

			embed
				.setTitle('Signal\'s Commands')
				.setDescription(stripIndent`
              **Prefix:** \`${prefix}\`
              **More Information:** \`${prefix}help [command]\`
              ${(!all && size != total) ? `**All Commands:** \`${prefix}help all\`` : ''}
            `)
				.setFooter(
					(!all && size != total) ?
						'Only showing available commands.\n' + message.member.displayName : message.member.displayName,
					message.author.displayAvatarURL({ dynamic: true }),
				)
				.setTimestamp()
				.setThumbnail(message.client.user.displayAvatarURL())
				.setColor(message.guild.me.displayHexColor);

			for (const type of Object.values(message.client.types)) {
				if (type === OWNER && !message.client.isOwner(message.author)) continue;
				if (commands[type][0]) embed.addField(`**${emojiMap[type]} [${commands[type].length}]**`, commands[type].join(' '));
			}

			embed.addField(
				'**Links**',
				'**[Invite Me](https://discord.com/oauth2/authorize?client_id=789809995478597642&scope=bot&permissions=498330710) | ' +
                '[Support Server](https://discord.gg/BGDyZMdvbw)**',
			);
		}

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const all = args?.first()?.value || '';

		const embed = new SignalEmbed(interaction);
		const prefix = interaction.client.db.get(`${interaction.guild.id}_prefix`);

		const { INFO, FUN, MISC, MOD, ADMIN, OWNER } = interaction.client.types;
		const { capitalize } = interaction.client.utils;

		const command = interaction.client.commands.get(args?.first()?.value.toLowerCase()) || interaction.client.aliases.get(args?.first()?.value.toLowerCase());
		if(command && (command.type !== OWNER || interaction.client.isOwner(interaction.user))) {
			embed
				.setTitle(`Command: \`${command.name}\``)
				.setThumbnail(interaction.client.user.displayAvatarURL())
				.setDescription(command.description)
				.addField('Usage', `\`${prefix}${command.usage}\``, true)
				.addField('Type', `\`${capitalize(command.type)}\``, true);

			if (command.aliases) embed.addField('Aliases', command.aliases.map(c => `\`${c}\``).join(' '));
			if (command.examples) embed.addField('Examples', command.examples.map(c => `\`${prefix}${c}\``).join('\n'));
		}
		else if(args?.first()?.value && all) {
			return this.sendSlashErrorMessage(interaction, 0, 'Unable to find command, please check provided command');
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
				[MOD]: `${mod} ${capitalize(MOD)}`,
				[ADMIN]: `${admin} ${capitalize(ADMIN)}`,
				[OWNER]: `${owner} ${capitalize(OWNER)}`,
			};

			interaction.client.commands.forEach(command_loop => {
				if (command_loop.userPermissions && command_loop.userPermissions.every(p => interaction.member.permissions.has(p)) && !all) commands[command_loop.type].push(`\`${command_loop.name}\``);
				else if(!command_loop.userPermissions || all) commands[command_loop.type].push(`\`${command_loop.name}\``);
			});

			const total = Object.values(commands).reduce((a, b) => a + b.length, 0) - commands[OWNER].length;
			const size = interaction.client.commands.size - commands[OWNER].length;

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
				type: 'STRING',
				description: '(Optional) Get Detailed Information about a command',
				required: false,
			}],
		};
	}
};