const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

module.exports = class CoinFlipCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'coinflip',
			usage: 'coinflip',
			description: 'Flips a coin',
			type: client.types.FUN,
			examples: ['coinflip'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction) {
		const n = Math.floor(Math.random() * 2);

		let result;

		if(n === 1) result = 'Heads';
		else result = 'Tails';

		const embed = new SignalEmbed(interaction)
			.setTitle(`${fun} Coinflip 🪙`)
			.setDescription(`I flipped a coin for you <@${interaction.user.id}>. It was **${result}**`);

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};