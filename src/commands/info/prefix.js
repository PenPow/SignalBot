const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			usage: 'prefix <new prefix>',
			aliases: ['pre'],
			description: 'Shows/sets the prefix for the server',
			type: client.types.INFO,
			examples: ['prefix', 'prefix s!', 'pre', 'pre s!'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {

		if(!message.member.permissions.has('ADMINISTRATOR') || !args[0]) {
			const prefix = this.client.db.get(`${message.guild.id}_prefix`);
			const embed = new MessageEmbed()
				.setTitle(`Signal's Prefix for ${message.guild.name}`)
				.addField('Prefix', `\`${prefix}\``, true)
				.addField('Example', `\`${prefix}ping\``, true)
				.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
				.setColor(message.guild.me.displayHexColor);
			return message.reply({ embeds: [embed] });
		}

		else {
			const prefix = this.client.db.get(`${message.guild.id}_prefix`);
			this.client.db.set(`${message.guild.id}_prefix`, args[0]);

			const embed = new MessageEmbed()
				.setTitle(`Updated Prefix for ${message.guild.name}`)
				.addField('Prefix', `\`${prefix}\` ➔ \`${args[0]}\``, true)
				.addField('Example', `\`${args[0]}ping\``, true)
				.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
				.setColor(message.guild.me.displayHexColor);
			return message.reply({ embeds: [embed] });
		}

	}

	async slashRun(interaction, args) {

		if(!interaction.member.permissions.has('ADMINISTRATOR') || !args.first()?.value) {
			const prefix = this.client.db.get(`${interaction.guild.id}_prefix`);
			const embed = new MessageEmbed()
				.setTitle(`Signal's Prefix for ${interaction.guild.name}`)
				.addField('Prefix', `\`${prefix}\``, true)
				.addField('Example', `\`${prefix}ping\``, true)
				.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
				.setColor(interaction.guild.me.displayHexColor);
			return interaction.reply({ ephemeral: true, embeds: [embed] });
		}

		else {
			const prefix = this.client.db.get(`${interaction.guild.id}_prefix`);
			this.client.db.set(`${interaction.guild.id}_prefix`, args.first().value);

			const embed = new MessageEmbed()
				.setTitle(`Updated Prefix for ${interaction.guild.name}`)
				.addField('Prefix', `\`${prefix}\` ➔ \`${args.first().value}\``, true)
				.addField('Example', `\`${args.first().value}ping\``, true)
				.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
				.setColor(interaction.guild.me.displayHexColor);
			return interaction.reply({ ephemeral: true, embeds: [embed] });
		}

	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'new_prefix',
				type: 'STRING',
				description: '(Optional) Sets the prefix for the guild (Administrator Only)',
				required: false,
			}],
		};
	}
};