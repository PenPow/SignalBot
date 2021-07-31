const { MessageEmbed } = require('discord.js');

class SignalEmbed extends MessageEmbed {
	constructor(messageInteraction, data = {}) {
		super(data);
		if(!messageInteraction) throw new Error('Missing MessageInteraction');

		this.setTimestamp()
			.setColor(messageInteraction.guild.me.displayHexColor)
			.setFooter(messageInteraction.member.displayName, messageInteraction?.author?.displayAvatarURL({ dynamic: true }) || messageInteraction?.user?.displayAvatarURL({ dynamic: true }));
	}

	setDescriptionFromBlockArray(blocks) {
		this.description = blocks.map(lines => lines.filter(l => !!l).join('\n')).filter(b => !!b.length).join('\n\n');
		return this;
	}
}

module.exports = SignalEmbed;