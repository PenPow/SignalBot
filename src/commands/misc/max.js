const Command = require('../../structures/Command');
const DiceExpression = require('dice-expression-evaluator');
const oneLine = require('common-tags').oneLine;

module.exports = class MaxCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'max',
			usage: 'max <roll>',
			aliases: ['maxroll', 'max-roll'],
			description: 'Calculates the highest possible roll for a dice expression, in standard RP format.',
			type: client.types.MISC,
			examples: ['max 2d20', 'maxroll 1d8 - 2d4', 'max-roll 4d6 + 3d8 - 2d12'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async slashRun(interaction, args) {
		try {
			const maxRoll = new DiceExpression(args.get('roll')?.value).min();
			interaction.reply({ content: `The highest diceroll possible is **${maxRoll}**`, ephemeral: true });
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
				type: 'STRING',
				description: 'The dice roll to evaluate',
				required: true,
			}],
		};
	}
};