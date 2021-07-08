const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');

const { fun } = require('../../utils/emojis.js');

const numberMap = {
	'0': ':zero:',
	'1': ':one:',
	'2': ':two:',
	'3': ':three:',
	'4': ':four:',
	'5': ':five:',
	'6': ':six:',
	'7': ':seven:',
	'8': ':eight:',
	'9': ':nine:',
};

module.exports = class EmojifyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'emojify',
			usage: 'emojify <message>',
			aliases: ['sayemoji'],
			description: 'Converts message to emoji',
			type: client.types.FUN,
			examples: ['emojify Hello World', 'sayemoji How are you'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		if (!args[0]) return this.sendErrorMessage(message, 0, 'Please provide a message to emojify');
		let msg = message.content.slice(message.content.indexOf(args[0]), message.content.length);
		msg = msg.split('').map(c => {
			if(c === ' ') return c;
			else if (/[0-9]/.test(c)) return numberMap[c];
			else return (/[a-zA-Z]/.test(c)) ? ':regional_indicator_' + c.toLowerCase() + ':' : '';
		}).join('');

		if(msg.length > 2048) {
			msg = msg.slice(0, msg.length - (msg.length - 2033));
			msg = msg.slice(0, msg.lastIndexOf(':')) + '**...**';
		}

		const embed = new MessageEmbed()
			.setTitle(`${fun} Emojify ▶️`)
			.setDescription(msg)
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction, args) {
		let msg = args.first()?.value.slice(args.first()?.value.indexOf(args.first()?.value), args.first()?.value.length);
		msg = msg.split('').map(c => {
			if(c === ' ') return c;
			else if (/[0-9]/.test(c)) return numberMap[c];
			else return (/[a-zA-Z]/.test(c)) ? ':regional_indicator_' + c.toLowerCase() + ':' : '';
		}).join('');

		if(msg.length > 2048) {
			msg = msg.slice(0, msg.length - (msg.length - 2033));
			msg = msg.slice(0, msg.lastIndexOf(':')) + '**...**';
		}

		const embed = new MessageEmbed()
			.setTitle(`${fun} Emojify ▶️`)
			.setDescription(msg)
			.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'message',
				type: 'STRING',
				description: 'Message to emojify',
				required: true,
			}],
		};
	}
};