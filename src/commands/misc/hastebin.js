const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const fetch = require('node-fetch');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { success } = require('../../utils/emojis');

module.exports = class HastebinCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'hastebin',
			usage: 'hastebin <text>',
			aliases: ['pastebin', 'bin'],
			description: 'Uploads the text provided into a hastebin',
			type: client.types.MISC,
			examples: ['hastebin hi', 'pastebin no', 'bin ive written over 100 examples 🎉'],
			guilds: ['GLOBAL'],
		});
	}

	async run(interaction, args) {
		const content = args.get('message').value;
		try {
			const res = await fetch('https://hastebin.com/documents', {
				method: 'POST',
				body: content,
				headers: { 'Content-Type': 'text/plain' },
			});

			const json = await res.json();
			if(!json.key) {
				return this.sendErrorMessage(interaction, 1, 'Please try again in a few seconds');
			}
			const url = 'https://hastebin.com/' + json.key + '.js';

			const embed = new SignalEmbed(interaction)
				.setTitle(`${success} Hastebin Created`)
				.setDescription(url);

			interaction.reply({ embeds: [embed], ephemeral: true });
		}
		catch(err) {
			interaction.client.logger.error(err.stack);
			return this.sendErrorMessage(interaction, 1, 'Please try again in a few seconds', err.message);
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'message',
				type: ApplicationCommandOptionType.String,
				description: 'Content to upload into the bin',
				required: true,
			}],
		};
	}
};