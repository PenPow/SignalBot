const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

const { fun } = require('../../utils/emojis.js');

module.exports = class RollCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'roll',
			usage: 'roll <dice sides>',
			aliases: ['dice', 'r'],
			description: 'Rolls a dice with the specified number of sides. Will default to 6 sides if no number is given.',
			type: client.types.FUN,
			examples: ['roll 6', 'dice 12', 'r 20'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		const limit = args[0] || 6;

		const n = Math.floor(Math.random() * limit + 1);

		if (!n || limit <= 0) return this.sendErrorMessage(message, 0, 'Please provide a valid number of dice sides');

		const embed = new MessageEmbed()
			.setTitle(`${fun} Dice Roll 🎲`)
			.setDescription(`<@${message.author.id}>, you rolled a **${n}**!`)
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		message.reply({ embeds: [embed] });
	}

	slashRun(interaction, args) {
		const limit = args.first()?.value || 6;

		const n = Math.floor(Math.random() * limit + 1);

		if (!n || limit <= 0) return this.sendSlashErrorMessage(interaction, 0, 'Please provide a valid number of dice sides');

		const embed = new MessageEmbed()
			.setTitle(`${fun} Dice Roll 🎲`)
			.setDescription(`<@${interaction.user.id}>, you rolled a **${n}**!`)
			.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'sides',
				type: 'INTEGER',
				description: 'How many sides do you want on the dice.',
				required: false,
			}],
		};
	}
};