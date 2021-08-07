const Command = require('../../structures/Command');
const oneLine = require('common-tags').oneLine;
const DiceExpression = require('dice-expression-evaluator');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class MinCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'min',
			usage: 'min <roll>',
			aliases: ['minroll', 'min-roll'],
			description: 'Calculates the minimum possible roll for a dice expression, in standard RP format.',
			type: client.types.MISC,
			examples: ['min 2d20', 'minroll 1d8 - 2d4', 'min-roll 4d6 + 3d8 - 2d12'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async run(interaction, args) {
		try {
			const minRoll = new DiceExpression(args.get('roll')?.value).min();
			interaction.reply({ content: `The lowest diceroll possible is **${minRoll}**`, ephemeral: true });
		}
		catch(err) {
			this.sendErrorMessage(interaction, 1, 'Invalid Dice Expression', oneLine`Dice expressions can contain the standard representations of dice in text form (e.g. 2d20 is two 20-sided dice), with addition and subtraction allowed.
			You may also use a single \`>\` or \`<\` symbol at the end of the expression to add a target for the total dice roll - for example, \`2d20 + d15 > 35\`.`);
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'roll',
				type: ApplicationCommandOptionType.String,
				description: 'The dice roll to evaluate',
				required: true,
			}],
		};
	}
};