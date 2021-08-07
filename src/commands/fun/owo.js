const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class OwoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'owo',
			usage: 'owo <text>',
			aliases: ['owoify', 'uwu', 'uwuify'],
			description: 'Converts text into OWO!',
			type: client.types.FUN,
			examples: ['owo test', 'owoify Hi!', 'uwu Hi!', 'uwuify test'],
			guilds: ['GLOBAL'],
		});
	}

	async run(interaction, args) {
		const embed = new SignalEmbed(interaction)
			.setDescription(Owoify(args.get('text').value));
		interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'text',
				type: ApplicationCommandOptionType.String,
				description: 'What text should we OWOify?',
				required: true,
			}],
		};
	}
};


const faces = ['(・`ω´・)', ';;w;;', 'owo', 'UwU', '>w<', '^w^'];

function Owoify(str) {
	return str
		.replace(/(?:r|l)/g, 'w')
		.replace(/(?:R|L)/g, 'W')
		.replace(/n([aeiou])/g, 'ny$1')
		.replace(/N([aeiou])/g, 'Ny$1')
		.replace(/N([AEIOU])/g, 'Ny$1')
		.replace(/ove/g, 'uv')
		.replace(/!+/g, ' ' + faces[Math.floor(Math.random() * faces.length)] + ' ');
}