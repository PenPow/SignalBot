const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const PirateSpeak = require('pirate-speak');

module.exports = class yarrCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'piratespeak',
			usage: 'piratespeak <text>',
			description: 'Yarr! Me hearties.',
			type: client.types.FUN,
			examples: ['piratespeak test', 'piratespeak Hi!', 'piratespeak Hi!', 'piratespeak test'],
		});
	}

	async run(interaction, args) {
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
				type: ApplicationCommandOptionType.String,
				description: 'Yarr! Me hearties. What text should I translate',
				required: true,
			}],
		};
	}
};