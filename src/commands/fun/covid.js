const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const fetch = require('node-fetch');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class CovidCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'covid',
			usage: 'covid <country | all>',
			description: 'Shows covid stats for the provided country.',
			type: client.types.FUN,
			examples: ['covid', 'covid world', 'covid USA'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	run(interaction, args) {
		const countries = args.get('country')?.value || 'world';

		if(countries === 'world' || countries === 'global' || countries === 'all') {
			fetch('https://covid19.mathdro.id/api')
				.then(response => response.json())
				.then(data => {
					const confirmed = data.confirmed.value.toLocaleString();
					const recovered = data.recovered.value.toLocaleString();
					const deaths = data.deaths.value.toLocaleString();
					const embed = new SignalEmbed(interaction)
						.setTitle(':mask: Worldwide COVID-19 Stats 🌎')
						.addField('Confirmed Cases', confirmed)
						.addField('Recovered', recovered)
						.addField('Deaths', deaths);

					interaction.reply({ ephemeral: true, embeds: [embed] });
				});
		}
		else {
			fetch(`https://covid19.mathdro.id/api/countries/${countries}`)
				.then(response => response.json())
				.then(data => {
					const confirmed = data.confirmed.value.toLocaleString();
					const recovered = data.recovered.value.toLocaleString();
					const deaths = data.deaths.value.toLocaleString();
					const embed = new SignalEmbed(interaction)
						.setTitle(`:mask: COVID-19 Stats for **${countries}**`)
						.addField('Confirmed Cases', confirmed)
						.addField('Recovered', recovered)
						.addField('Deaths', deaths);

					interaction.reply({ ephemeral: true, embeds: [embed] });
				}).catch(() => {
					this.sendErrorMessage(interaction, 1, 'Invalid country provided');
				});
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'country',
				type: ApplicationCommandOptionType.String,
				description: '(Optional) Country to lookup Covid Statistics For',
				required: false,
			}],
		};
	}
};