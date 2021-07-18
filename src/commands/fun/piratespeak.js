const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const PirateSpeak = require('pirate-speak');

module.exports = class yarrCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'piratespeak',
			usage: 'piratespeak <text>',
			aliases: ['ps', 'yarr', 'yarrspeak'],
			description: 'Yarr! Me hearties.',
			type: client.types.FUN,
			examples: ['piratespeak test', 'ps Hi!', 'yarr Hi!', 'yarrspeak test'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		if(!args[0]) return this.sendErrorMessage(message, 0, 'Please provide some text to ASCIIify');

		const embed = new SignalEmbed(message)
			.setDescription(PirateSpeak.translate(args.join(' ')));

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const embed = new SignalEmbed(interaction)
			.setDescription(PirateSpeak.translate(args.get('text').value));
		interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'text',
				type: 'STRING',
				description: 'Yarr! Me hearties. What text should I translate',
				required: true,
			}],
		};
	}
};