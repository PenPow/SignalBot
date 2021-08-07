const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class lmgtfyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'lmgtfy',
			usage: 'lmgtfy <query>',
			description: 'Send a LMGTFY (Let Me Google That For You) link.',
			type: client.types.MISC,
			examples: ['lmgtfy discord'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction, args) {
		const url = new URL('https://letmegooglethat.com/');
		url.searchParams.append('q', args.get('query')?.value);

		const embed = new SignalEmbed(interaction)
			.setTitle('Let Me Google That for You')
			.setDescription(`[Link](${url})`);

		interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'query',
				type: ApplicationCommandOptionType.String,
				description: 'The google search term.',
				required: true,
			}],
		};
	}
};