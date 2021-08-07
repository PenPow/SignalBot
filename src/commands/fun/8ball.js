const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

const answers = [
	'It is certain.',
	'It is decidedly so.',
	'Without a doubt.',
	'Yes - definitely.',
	'You may rely on it.',
	'As I see it, yes.',
	'Most likely.',
	'Outlook good.',
	'Yes.',
	'Signs point to yes.',
	'Reply hazy, try again.',
	'Ask again later.',
	'Better not tell you now.',
	'Cannot predict now.',
	'Concentrate and ask again.',
	'Don\'t count on it.',
	'My reply is no.',
	'My sources say no.',
	'Outlook not so good.',
	'Very doubtful.',
];

module.exports = class EightBallCommand extends Command {
	constructor(client) {
		super(client, {
			name: '8ball',
			usage: '8ball <question>',
			description: 'Asks the magic 8-Ball for some physic wisdom.',
			type: client.types.FUN,
			examples: ['8ball Am I going to become a superhero?'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	run(interaction, args) {
		const question = args.first()?.value;

		const embed = new SignalEmbed(interaction)
			.setTitle(`${fun} Magic 8-Ball 🎱`)
			.addField('Question', question)
			.addField('Answer', answers[Math.floor(Math.random() * answers.length)]);

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'question',
				type: ApplicationCommandOptionType.String,
				description: 'Question to ask the mystical eight ball',
				required: true,
			}],
		};
	}
};