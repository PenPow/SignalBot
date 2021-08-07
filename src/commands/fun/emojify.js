const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

const { fun } = require('../../utils/emojis.js');

const numberMap = {
	'0': ':zero:',
	'1': ':one:',
	'2': ':two:',
	'3': ':three:',
	'4': ':four:',
	'5': ':five:',
	'6': ':six:',
	'7': ':seven:',
	'8': ':eight:',
	'9': ':nine:',
};

module.exports = class EmojifyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'emojify',
			usage: 'emojify <message>',
			description: 'Converts message to emoji',
			type: client.types.FUN,
			examples: ['emojify Hello World'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction, args) {
		let msg = args.first()?.value.slice(args.first()?.value.indexOf(args.first()?.value), args.first()?.value.length);
		msg = msg.split('').map(c => {
			if(c === ' ') return c;
			else if (/[0-9]/.test(c)) return numberMap[c];
			else return (/[a-zA-Z]/.test(c)) ? ':regional_indicator_' + c.toLowerCase() + ':' : '';
		}).join('');

		if(msg.length > 2048) {
			msg = msg.slice(0, msg.length - (msg.length - 2033));
			msg = msg.slice(0, msg.lastIndexOf(':')) + '**...**';
		}

		const embed = new SignalEmbed(interaction)
			.setTitle(`${fun} Emojify ▶️`)
			.setDescription(msg);

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'message',
				type: ApplicationCommandOptionType.String,
				description: 'Message to emojify',
				required: true,
			}],
		};
	}
};