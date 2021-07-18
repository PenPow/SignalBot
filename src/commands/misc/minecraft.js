const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { fun } = require('../../utils/emojis.js');

const gamedig = require('gamedig');

module.exports = class MinecraftCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'minecraft',
			usage: 'minecraft <ip>',
			aliases: ['mc', 'mclookup'],
			description: 'Fetches information about a given minecraft server! (Java and Bedrock Supported)',
			type: client.types.FUN,
			examples: ['minecraft play.hypixel.net', 'mc play.hypixel.net', 'mclookup play.hypixel.net'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		if(!args[0]) return this.sendErrorMessage(message, 0, 'Please provide an IP address');

		const ip = args[0];
		const favicon = `https://eu.mc-api.net/v3/server/favicon/${ip}`;

		let options = {
			type: 'minecraft',
			host: ip,
		};

		if(ip.split(':').length > 1) {
			options = {
				type: 'minecraft',
				host: ip.split(':')[0],
				port: ip.split(':')[1],
			};
		}

		const embed = new SignalEmbed(message)
			.setTitle('🔎 Searching!')
			.setDescription('Please note that this make take up to 5 seconds while we connect to the query server.');

		message.reply({ embeds: [embed] });

		let json = null;

		await gamedig.query(options).then((res) => {
			json = res;
		// eslint-disable-next-line no-empty-function
		}).catch(() => {

		});

		if(!json) {
			options.type = 'minecraftpe';
			await gamedig.query(options).then((res) => {
				json = res;
			}).catch(() => {
				return this.sendErrorMessage(message, 2, 'Unable to reach server', 'This is likely caused by the fact that\nA) The Server is Offline\nB) Query is disabled in server.properties\nC) Firewall is incorrectly configured.');
			});
		}

		const imgRes = 'https://www.minecraftskinstealer.com/achievement/a.php?i=2&h=Success&t=' + ip;

		embed.setAuthor(json.name)
			.setTitle(`${fun} MC Server Details`)
			.addField('Version', json?.raw?.vanilla?.raw?.version?.name || json?.raw?.bedrock?.raw?.mcVersion)
			.addField('Player Count', `${(json.raw.players ? json.raw.players.online : json.players.length) || json?.players} / ${(json.raw.players ? json.raw.players.max : json.maxplayers)}`)
			.addField('IP', json.connect)
			.setThumbnail(favicon)
			.setImage(imgRes);

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		const ip = args.get('ip')?.value;
		const favicon = `https://eu.mc-api.net/v3/server/favicon/${ip}`;

		let options = {
			type: 'minecraft',
			host: ip,
		};

		if(ip.split(':').length > 1) {
			options = {
				type: 'minecraft',
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

		});

		if(!json) {
			options.type = 'minecraftpe';
			await gamedig.query(options).then((res) => {
				json = res;
			}).catch(() => {
				return this.sendErrorMessage(interaction, 2, 'Unable to reach server', 'This is likely caused by the fact that\nA) The Server is Offline\nB) Query is disabled in server.properties\nC) Firewall is incorrectly configured.');
			});
		}

		const imgRes = 'https://www.minecraftskinstealer.com/achievement/a.php?i=2&h=Success&t=' + ip;

		embed.setAuthor(json.name)
			.setTitle(`${fun} MC Server Details`)
			.addField('Version', json?.raw?.vanilla?.raw?.version?.name || json?.raw?.bedrock?.raw?.mcVersion)
			.addField('Player Count', `${(json.raw.players ? json.raw.players.online : json.players.length) || json?.players} / ${(json.raw.players ? json.raw.players.max : json.maxplayers)}`)
			.addField('IP', json.connect)
			.setThumbnail(favicon)
			.setImage(imgRes);

		interaction.editReply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'ip',
				type: 'STRING',
				description: 'IP Adress of the MC server to lookup',
				required: true,
			}],
		};
	}
};