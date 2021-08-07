const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const fetch = require('node-fetch');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

const Intl = require('intl');
Intl.__disableRegExpRestore();

module.exports = class CountryCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'country',
			usage: 'country <name>',
			description: 'Shows information about a given country',
			type: client.types.MISC,
			examples: ['country usa'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction, args) {
		const embed = new SignalEmbed(interaction);

		const endpoint = args.get('country')?.value.split('').length <= 3 ? 'alpha' : 'name';

		try {
			const data = await fetch(`https://restcountries.eu/rest/v2/${endpoint}/${encodeURIComponent(args.get('country')?.value)}`).then(res => res.json()).then(body => body[0] || body).catch(err => err);

			if(data.status && data.status !== 200) throw new Error('No Country Found');

			embed.setTitle(`:flag_${data.alpha2Code.toLowerCase()}: ${data.name}`)
				.addFields([
					{ name: 'Also Known As', value: data.altSpellings.join(', '), inline: true },
					{ name: 'Languages', value: data.languages.map(l => `**${l.name}** (${l.nativeName})`).join(', '), inline: true },
					{ name: 'Capital', value: data.capital, inline: true },
					{ name: 'Region', value: data.region, inline: true },
					{ name: 'Population', value: this.formatNumber(data.population), inline: true },
					{ name: 'Area', value: this.formatNumber(data.area), inline: true },
					{ name: 'Timezones', value: data.altSpellings.join(', '), inline: true },
					{ name: 'Currencies', value: data.currencies.map(c => `**${c.name}** (${c.symbol})`).join(', '), inline: true },
				]);

			interaction.reply({ embeds: [embed], ephemeral: true });
		}
		catch(err) {
			this.sendErrorMessage(interaction, 1, 'Please try again in a few seconds', err.message);
		}
	}

	formatNumber(value) {
		const formatter = new Intl.NumberFormat('en');
		return formatter.format(value);
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'country',
				type: ApplicationCommandOptionType.String,
				description: 'The country name/acronym',
				required: true,
			}],
		};
	}
};