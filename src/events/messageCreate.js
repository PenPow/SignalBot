const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

// const Filter = require('bad-words');
// const filter = new Filter();

class messageCreate {
	constructor(client) {
		this.client = client;
	}

	async run(args) {
		const [message] = args;
		if (message.partial) {
			try {
				await message.fetch();
			}
			catch (e) {
				this.client.logger.error(`An Error Occured in Fetching Partial Message ->\n${e}`);
			}
		}

		if(message.author.partial) {
			try {
				await message.author.fetch();
			}
			catch (e) {
				this.client.logger.error(`An Error Occured in Fetching Partial Author ->\n${e}`);
			}
		}

		if(message.channel.partial) {
			try {
				await message.channel.fetch();
			}
			catch (e) {
				this.client.logger.error(`An Error Occured in Fetching Partial Channel ->\n${e}`);
			}
		}

		if (!message.channel.viewable || message.author.bot) return;

		this.client.db.ensure(`${message.guild.id}_prefix`, this.client.config.configuration.defaultPrefix);
		const prefix = this.client.db.get(`${message.guild.id}_prefix`);

		if(message.content.startsWith(prefix)) {

			let cmdArgs = message.content.slice(prefix.length).trim();

			if(cmdArgs.charAt(prefix.length + 1 === ' ')) cmdArgs.substring(prefix.length + 1, '');

			cmdArgs = cmdArgs.split(' ');

			const cmd = cmdArgs.shift().toLowerCase();

			const command = this.client.commands.get(cmd) || this.client.aliases.get(cmd);
			if(command && !command.disabled) {

				if(command.ownerOnly && !this.client.isOwner(message.author)) return;
				if((command.type === this.client.types.OWNER) && !this.client.isOwner(message.author)) return;
				if(command.guildOnly && !message.guild) return message.reply('This command can only be used in a guild channel.');
				if((command.guilds[0] !== 'GLOBAL') && !command.guilds.includes(message.guild.id)) return;

				if(command.clientPermissions && command.clientPermissions.includes('EMBED_LINKS') && !message.channel.permissionsFor(message.guild.me).has(['EMBED_LINKS'])) return message.reply('I require the the Embed Links permission to function correctly, please enable this to use the bot.');

				const permissions = command.checkPermissions(message);

				if(permissions) {
					message.command = true;
					return command.run(message, cmdArgs, this.client.subscriptions.get(message.guild.id));
				}

			}
		}
		else if (
			(message.content === `<@${this.client.user.id}>` || message.content === `<@!${this.client.user.id}>`) &&
      message.channel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])
		) {
			const embed = new MessageEmbed()
				.setTitle('Hi, I\'m Signal. Need help?')
				.setThumbnail(message.guild.me.user.displayAvatarURL({ dynamic: true }))
				.setDescription(`You can see everything I can do by using the \`${prefix}help\` command.`)
				.addField('Invite Me', oneLine`
          You can add me to your server by clicking 
          [here](https://discord.com/api/oauth2/authorize?client_id=789809995478597642&permissions=1610083831&scope=bot)!
        `)
				.addField('Support', oneLine`
          If you have questions, suggestions, or found a bug, please join the 
          [Support Server](https://discord.gg/BGDyZMdvbw)!
        `)
				.addField('Prefix', `My Prefix for ${message.guild.name} is \`${prefix}\``)
				.setFooter('DM PenPow#7067 to speak directly with the developer!')
				.setColor(message.guild.me.displayHexColor);
			message.reply(embed);
		}
	}
}

module.exports = messageCreate;