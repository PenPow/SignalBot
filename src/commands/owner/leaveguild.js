const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis');

const rgx = /^(?:<@!?)?(\d+)>?$/;

module.exports = class LeaveGuildCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'leaveguild',
			usage: 'leaveguld <serverid>',
			aliases: ['leave', 'exit'],
			description: 'Leaves the specified guild',
			type: client.types.OWNER,
			ownerOnly: true,
			examples: ['leave 789215359878168586', 'leaveguild 789215359878168586', 'exit 789215359878168586'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['789215359878168586'],
		});
	}
	async run(message, args) {
		const input = args[0];
		if (!input) return this.sendErrorMessage(message, 0, 'Please provide a server id');

		if(!this.checkPermissions(message, true)) return;

		if(!rgx.test(input)) return this.sendErrorMessage(message, 0, 'Please provide a valid server ID');

		let guild;

		try {
			guild = await this.client.guilds.fetch(input);
		}
		catch(e) {
			return this.client.logger.error(e.stack);
		}

		if(!guild) return this.sendErrorMessage(message, 0, 'Unable to find server, please check the provided ID');

		await guild.leave();
		const embed = new MessageEmbed()
			.setTitle(`${success} Left ${guild.name}`)
			.setDescription(`I have successfully left **${guild.name}**.`)
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);
		message.reply({ embeds: [embed] });
	}
};