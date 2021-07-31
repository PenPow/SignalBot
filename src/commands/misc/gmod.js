const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const gamedig = require('gamedig');

module.exports = class GModCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'gmod',
			usage: 'gmod <ip>',
			aliases: ['gmodlookup'],
			description: 'Fetches information about a given Garry\'s Mod server!',
			type: client.types.MISC,
			examples: ['gmod <IP>', 'gmodlookup <IP>'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
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

		await interaction.defer({ ephemeral: true });

		let json = null;

		await gamedig.query(options).then((res) => {
			json = res;
		// eslint-disable-next-line no-empty-function
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
				type: 'STRING',
				description: 'IP Adress of the GMOD server to lookup',
				required: true,
			}],
		};
	}
};