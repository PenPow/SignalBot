const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class CovidCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'covid',
			usage: 'covid <country | all>',
			description: 'Shows covid stats for the provided country.',
			type: client.types.FUN,
			examples: ['covid', 'covid world', 'covid USA'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	run(message, args) {
		const countries = args.join(' ');

		if(countries === 'world' || countries === 'global' || countries === 'all' || !args[0]) {
			fetch('https://covid19.mathdro.id/api')
				.then(response => response.json())
				.then(data => {
					const confirmed = data.confirmed.value.toLocaleString();
					const recovered = data.recovered.value.toLocaleString();
					const deaths = data.deaths.value.toLocaleString();
					const embed = new MessageEmbed()
						.setTitle(':mask: Worldwide COVID-19 Stats 🌎')
						.addField('Confirmed Cases', confirmed)
						.addField('Recovered', recovered)
						.addField('Deaths', deaths)
						.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
						.setTimestamp()
						.setColor(message.guild.me.displayHexColor);

					message.reply({ embeds: [embed] });
				});
		}
		else {
			fetch(`https://covid19.mathdro.id/api/countries/${countries}`)
				.then(response => response.json())
				.then(data => {
					const confirmed = data.confirmed.value.toLocaleString();
					const recovered = data.recovered.value.toLocaleString();
					const deaths = data.deaths.value.toLocaleString();
					const embed = new MessageEmbed()
						.setTitle(`:mask: COVID-19 Stats for **${countries}**`)
						.addField('Confirmed Cases', confirmed)
						.addField('Recovered', recovered)
						.addField('Deaths', deaths)
						.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
						.setTimestamp()
						.setColor(message.guild.me.displayHexColor);

					message.reply({ embeds: [embed] });
				}).catch(() => {
					this.sendErrorMessage(message, 1, 'Invalid country provided');
				});
		}
	}

	slashRun(interaction, args) {
		const countries = args.first()?.value || 'world';

		if(countries === 'world' || countries === 'global' || countries === 'all') {
			fetch('https://covid19.mathdro.id/api')
				.then(response => response.json())
				.then(data => {
					const confirmed = data.confirmed.value.toLocaleString();
					const recovered = data.recovered.value.toLocaleString();
					const deaths = data.deaths.value.toLocaleString();
					const embed = new MessageEmbed()
						.setTitle(':mask: Worldwide COVID-19 Stats 🌎')
						.addField('Confirmed Cases', confirmed)
						.addField('Recovered', recovered)
						.addField('Deaths', deaths)
						.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
						.setTimestamp()
						.setColor(interaction.guild.me.displayHexColor);

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
					const embed = new MessageEmbed()
						.setTitle(`:mask: COVID-19 Stats for **${countries}**`)
						.addField('Confirmed Cases', confirmed)
						.addField('Recovered', recovered)
						.addField('Deaths', deaths)
						.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
						.setTimestamp()
						.setColor(interaction.guild.me.displayHexColor);

					interaction.reply({ ephemeral: true, embeds: [embed] });
				}).catch(() => {
					this.sendSlashErrorMessage(interaction, 1, 'Invalid country provided');
				});
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'country',
				type: 'STRING',
				description: '(Optional) Country to lookup Covid Statistics For',
				required: false,
			}],
		};
	}
};