const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const BinaryRegex = /\b[01]+\b/;

module.exports = class BinaryCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'binary',
			usage: 'binary <text>',
			description: 'Converts any text/message into binary notation (and any binary into text).',
			type: client.types.MISC,
			examples: ['binary Signal V3 When?'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction, args) {
		const embed = new SignalEmbed(interaction);

		const input = args.get('text')?.value;

		if (input.match(BinaryRegex)) {
			embed
				.setTitle('Binary to Text')
				.setDescription(this.binaryToText(input));
		}
		else {
			embed
				.setTitle('Text to Binary')
				.setDescription(this.textToBinary(input));
		}

		interaction.reply({ embeds: [embed], ephemeral: true });
	}

	textToBinary(text) {
		return text.split('').map(function(char) {
			return char.charCodeAt(0).toString(2);
		}).join(' ');
	}

	binaryToText(str) {
		let binString = '';

		str.split(' ').map(function(bin) {
			binString += String.fromCharCode(parseInt(bin, 2));
		});

		return binString;
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'text',
				type: ApplicationCommandOptionType.String,
				description: 'The message to convert to binary (and vice versa)',
				required: true,
			}],
		};
	}
};