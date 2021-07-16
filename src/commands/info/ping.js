const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
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
		const embed = new SignalEmbed(message)
			.setDescription('`Pinging...`');

		const msg = await message.reply({ embeds: [embed] });
		const timestamp = (message.editedTimestamp) ? message.editedTimestamp : message.createdTimestamp;
		const latency = `\`\`\`ini\n[ ${Math.floor(msg.createdTimestamp - timestamp)}ms ]\`\`\``;
		const apiLatency = `\`\`\`ini\n[ ${Math.round(message.client.ws.ping)}ms ]\`\`\``;
		embed.setTitle(`Pong!  ${pong}`)
			.setDescription('')
			.addField('Latency', latency, true)
			.addField('API Latency', apiLatency, true);

		msg.edit({ embeds: [embed] });
	}

	async slashRun(interaction) {
		const embed = new SignalEmbed(interaction)
			.setDescription('`Pinging...`');

		await interaction.reply({ embeds: [embed], empeheral: true });
		const msg = await interaction.fetchReply();
		const timestamp = interaction.createdTimestamp;
		const latency = `\`\`\`ini\n[ ${Math.floor(msg.createdTimestamp - timestamp)}ms ]\`\`\``;
		const apiLatency = `\`\`\`ini\n[ ${Math.round(interaction.client.ws.ping)}ms ]\`\`\``;
		embed.setTitle(`Pong!  ${pong}`)
			.setDescription('')
			.addField('Latency', latency, true)
			.addField('API Latency', apiLatency, true);

		interaction.editReply({ embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};