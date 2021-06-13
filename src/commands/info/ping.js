const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { pong } = require('../../utils/emojis.js');

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			usage: 'ping',
			description: 'Fetches Signal\'s current latency and API latency.',
			type: client.types.INFO,
			guilds: ['GLOBAL'],
			examples: ['ping'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}
	async run(message) {
		const embed = new MessageEmbed()
			.setDescription('`Pinging...`')
			.setColor(message.guild.me.displayHexColor);

		const msg = await message.reply({ embeds: [embed] });
		const timestamp = (message.editedTimestamp) ? message.editedTimestamp : message.createdTimestamp;
		const latency = `\`\`\`ini\n[ ${Math.floor(msg.createdTimestamp - timestamp)}ms ]\`\`\``;
		const apiLatency = `\`\`\`ini\n[ ${Math.round(message.client.ws.ping)}ms ]\`\`\``;
		embed.setTitle(`Pong!  ${pong}`)
			.setDescription('')
			.addField('Latency', latency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp();

		msg.edit({ embeds: [embed] });
	}

	async slashRun(interaction) {
		const embed = new MessageEmbed()
			.setDescription('`Pinging...`')
			.setColor(interaction.guild.me.displayHexColor);

		await interaction.reply({ embeds: [embed], empeheral: true });
		const msg = await interaction.fetchReply();
		const timestamp = interaction.createdTimestamp;
		const latency = `\`\`\`ini\n[ ${Math.floor(msg.createdTimestamp - timestamp)}ms ]\`\`\``;
		const apiLatency = `\`\`\`ini\n[ ${Math.round(interaction.client.ws.ping)}ms ]\`\`\``;
		embed.setTitle(`Pong!  ${pong}`)
			.setDescription('')
			.addField('Latency', latency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp();

		interaction.editReply({ embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};