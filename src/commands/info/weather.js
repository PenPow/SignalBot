const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
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
			guilds: ['GLOBAL'],
		});
	}
	run(message, args) {
		try {
			if(!args[0]) return this.sendErrorMessage(message, 0, 'Please mention a location.');
			weather.find({ search: args.join(' '), degreeType: 'C' }, (err, result) => {
				if(err) message.channel.send(err.message);
				if(result.length === 0) return this.sendErrorMessage(message, 1, 'Please Enter a valid location!');
				const current = result[0].current;
				const location = result[0].location;

				const embed = new SignalEmbed(message)
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
				message.reply({ embeds: [embed] });
			});
		}
		catch (err) {
			this.sendErrorMessage(message, 1, 'Location not Found');
		}
	}

	slashRun(interaction, args) {
		try {
			weather.find({ search: args.first().value, degreeType: 'C' }, (err, result) => {
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
				type: 'STRING',
				description: 'Location to search the weather for',
				required: true,
			}],
		};
	}
};