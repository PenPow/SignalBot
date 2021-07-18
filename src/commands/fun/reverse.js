const Command = require('../../structures/Command');

module.exports = class ReverseCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reverse',
			usage: 'reverse <text>',
			description: 'Reverses any text',
			type: client.types.FUN,
			examples: ['reverse test'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		if(!args[0]) return this.sendErrorMessage(message, 0, 'Please provide some text to ASCIIify');

		message.reply({ content: args.join(' ').split('').reverse().join('') });
	}

	async slashRun(interaction, args) {
		interaction.reply({ content: args.get('text').value.split('').reverse().join(''), ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'text',
				type: 'STRING',
				description: 'What text should we ASCIIify?',
				required: true,
			}],
		};
	}
};