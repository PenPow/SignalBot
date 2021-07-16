const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

module.exports = class CoinFlipCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'coinflip',
			usage: 'coinflip',
			aliases: ['cointoss', 'coin', 'flip', 'cf'],
			description: 'Flips a coin',
			type: client.types.FUN,
			examples: ['coinflip', 'cointoss', 'coin', 'flip', 'cf'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message) {
		const n = Math.floor(Math.random() * 2);

		let result;

		if(n === 1) result = 'Heads';
		else result = 'Tails';

		const embed = new SignalEmbed(message)
			.setTitle(`${fun} Coinflip 🪙`)
			.setDescription(`I flipped a coin for you <@${message.author.id}>. It was **${result}**`);

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction) {
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