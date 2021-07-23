const { MessageEmbed } = require('discord.js');

class SignalEmbed extends MessageEmbed {
	constructor(messageInteraction, data = {}) {
		if(!messageInteraction) throw new Error('Missing MessageInteraction');
		super(data);

		this.setTimestamp()
			.setColor(messageInteraction.guild.me.displayHexColor)
			.setFooter(messageInteraction.member.displayName, messageInteraction?.author?.displayAvatarURL({ dynamic: true }) || messageInteraction?.user?.displayAvatarURL({ dynamic: true }));
	}
}

module.exports = SignalEmbed;