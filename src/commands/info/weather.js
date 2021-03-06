const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const weather = require('weather-js');

module.exports = class WeatherCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'weather',
			usage: 'weather <city>',
			description: 'Shows the weather of a location',
			type: client.types.INFO,
			examples: ['weather London'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	run(interaction, args) {
		try {
			weather.find({ search: args.get('location').value, degreeType: 'C' }, (err, result) => {
				if(err) interaction.channel.send(err.message);
				if(result.length === 0) return this.sendErrorMessage(interaction, 1, 'Please Enter a valid location!');
				const current = result[0].current;
				const location = result[0].location;

				const embed = new SignalEmbed(interaction)
					.setDescription(`**${current.skytext}**`)
					.setAuthor(`🌥️ Weather for ${current.observationpoint}`)
					.setThumbnail(current.imageUrl)
					.addField('**Timezone**', `UTC ${location.timezone}`, true)
					.addField('**Temperature**', `${current.temperature} ${location.degreetype}°`, true)
					.addField('**Feels Like**', `${current.feelslike} ${location.degreetype}°`, true)
					.addField('**Winds**', `${current.winddisplay}`, true)
					.addField('**Humidity**', `${current.humidity}%`, true)
					.addField('**Date**', `${current.date}`, true)
					.addField('**Day**', `${current.day}`, true);
				interaction.reply({ ephemeral: true, embeds: [embed] });
			});
		}
		catch (err) {
			this.sendErrorMessage(interaction, 1, 'City not Found');
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'location',
				type: ApplicationCommandOptionType.String,
				description: 'Location to search the weather for',
				required: true,
			}],
		};
	}
};