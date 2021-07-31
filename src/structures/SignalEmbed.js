const { MessageEmbed } = require('discord.js');

class SignalEmbed extends MessageEmbed {
	constructor(interaction, data = {}) {
		super(data);
		if(!interaction) throw new Error('Missing Interaction');

		this.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor)
			.setFooter(interaction.member.displayName, interaction?.user?.displayAvatarURL({ dynamic: true }));
	}

	setDescriptionFromBlockArray(blocks) {
		this.description = blocks.map(lines => lines.filter(l => !!l).join('\n')).filter(b => !!b.length).join('\n\n');
		return this;
	}
}

module.exports = SignalEmbed;