const Command = require('../../structures/Command');

const figlet = require('figlet');
const asyncFiglet = require('util').promisify(figlet);

module.exports = class AsciiCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ascii',
			usage: 'ascii <text>',
			description: 'Converts text into ASCII',
			type: client.types.FUN,
			examples: ['ascii test', 'ascii Hi!'],
			guilds: ['GLOBAL'],
		});
	}

	async run(interaction, args) {
		const rendered = await asyncFiglet(args.get('text').value);
		interaction.reply({ content: '```' + rendered + '```', ephemeral: true });
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