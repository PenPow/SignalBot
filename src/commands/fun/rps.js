const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const rps = ['scissors', 'rock', 'paper'];
const res = ['Scissors :v:', 'Rock :fist:', 'Paper :raised_hand:'];

module.exports = class RPSCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'rps',
			usage: 'rps <rock | paper | scissors>',
			description: 'Play a game of rock–paper–scissors against Signal!',
			type: client.types.FUN,
			examples: ['rps rock'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	slashRun(interaction, args) {
		const userChoice = rps.indexOf(args.first()?.value.toLowerCase());
		const botChoice = Math.floor(Math.random() * 3);

		let result;

		if(botChoice === userChoice) result = 'It\'s a draw!';
		else if(botChoice > userChoice || botChoice === 0 && userChoice === 2) result = '**Signal** wins!';
		else result = `<@${interaction.user.id}> wins!`;

		const embed = new SignalEmbed(interaction)
			.setTitle(`${fun} ${interaction.user.tag} vs Signal`)
			.addField('Your Choice:', res[userChoice], true)
			.addField('Signal\'s Choice', res[botChoice], true)
			.addField('Result', result, true);

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'option',
				type: 'STRING',
				description: 'Rock, paper or scissors',
				required: true,
				choices: [
					{
						name: 'Rock',
						value: 'rock',
					},
					{
						name: 'Paper',
						value: 'paper',
					},
					{
						name: 'Scissors',
						value: 'scissors',
					},
				],
			}],
		};
	}
};