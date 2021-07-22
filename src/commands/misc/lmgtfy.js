const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

module.exports = class lmgtfyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'lmgtfy',
			usage: 'lmgtfy <query>',
			aliases: ['letmegooglethatforyou', 'letmegooglethat'],
			description: 'Send a LMGTFY (Let Me Google That For You) link.',
			type: client.types.MISC,
			examples: ['lmgtfy discord', 'letmegooglethatforyou signal bot', 'letmegooglethat internet'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		if(!args[0]) return this.sendErrorMessage(message, 0, 'Please provide a search query');
		const url = new URL('https://letmegooglethat.com/');
		url.searchParams.append('q', args.join(' '));

		const embed = new SignalEmbed(message)
			.setTitle('Let Me Google That for You')
			.setDescription(`[Link](${url})`);

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
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
				type: 'STRING',
				description: 'The google search term.',
				required: true,
			}],
		};
	}
};