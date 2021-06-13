const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

const Filter = require('bad-words');
const filter = new Filter();

module.exports = async (client, message) => {
    if (message.partial) {
        try {
            await message.fetch()
        } catch (e) {
            client.logger.error(`An Error Occured in Fetching Partial Message ->\n${e}`)
        }
    }
  
    if(message.author.partial) {
      try {
          await message.author.fetch()
      } catch (e) {
          client.logger.error(`An Error Occured in Fetching Partial Author ->\n${e}`)
      }
    }
    
    if(message.channel.partial) {
        try {
            await message.channel.fetch()
        } catch (e) {
            client.logger.error(`An Error Occured in Fetching Partial Channel ->\n${e}`)
        }
    }
    
    if (message.channel.type === 'dm' || !message.channel.viewable || message.author.bot) return;

    client.db.ensure(`${message.guild.id}_prefix`, client.config.configuration.defaultPrefix)
    const prefix = client.db.get(`${message.guild.id}_prefix`);
    
    if(message.content.startsWith(prefix)) {
      
        let args = message.content.slice(prefix.length).trim();

        if(args.charAt(prefix.length + 1 === ' ')) args.substring(prefix.length + 1, '');

        args = args.split(' ');

        const cmd = args.shift().toLowerCase();

        let command = client.commands.get(cmd) || client.aliases.get(cmd);
        if(command && !command.disabled) {

          if(command.ownerOnly && !client.isOwner(message.author)) return;
          if((command.type === client.types.OWNER) && !client.isOwner(message.author)) return;
          if(command.guildOnly && !message.guild) return message.reply("This command can only be used in a guild channel.");
          if((command.guilds[0] !== 'GLOBAL') && !command.guilds.includes(message.guild.id)) return;

          const permissions = command.checkPermissions(message);

          if(permissions) {
            message.command = true;
            return command.run(message, args);
          };
            
        };
    }
    else if ( 
      (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) &&
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
};