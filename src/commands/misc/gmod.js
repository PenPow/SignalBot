const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const gamedig = require('gamedig');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class GModCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'gmod',
			usage: 'gmod <ip>',
			description: 'Fetches information about a given Garry\'s Mod server!',
			type: client.types.MISC,
			examples: ['gmod <IP>'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction, args) {
		const ip = args.get('ip')?.value;
		let options = {
			type: 'garrysmod',
			host: ip,
		};

		if(ip.split(':').length > 1) {
			options = {
				type: 'garrysmod',
				host: ip.split(':')[0],
				port: ip.split(':')[1],
			};
		}

		const embed = new SignalEmbed(interaction);

		await interaction.deferReply({ ephemeral: true });

		let json = null;

		await gamedig.query(options).then((res) => {
			json = res;
		}).catch(() => {
			return this.sendErrorMessage(interaction, 2, 'Unable to reach server', 'This is likely caused by the fact that\nA) The Server is Offline\nB) Query is disabled\nC) Firewall is incorrectly configured.');
		});

		embed.setAuthor(json.name)
			.setTitle(`${fun} GMOD Server Details`)
			.addField('Game', json?.raw?.game)
			.addField('Player Count', `${(json.raw.numplayers)} / ${(json.maxplayers)}`)
			.addField('IP', json.connect);

		interaction.editReply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'ip',
				type: ApplicationCommandOptionType.String,
				description: 'IP Adress of the GMOD server to lookup',
				required: true,
			}],
		};
	}
};