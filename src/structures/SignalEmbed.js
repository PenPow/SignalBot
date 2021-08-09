const { MessageEmbed } = require('discord.js');

class SignalEmbed extends MessageEmbed {
	constructor(interaction, data = {}) {
		super(data);
		if(!interaction) return;

		this.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor)
			.setFooter(interaction.member.displayName, interaction?.user?.displayAvatarURL({ dynamic: true }));
	}
}

module.exports = SignalEmbed;