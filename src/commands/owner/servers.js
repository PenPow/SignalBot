const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require("../../utils/emojis");
const ReactionMenu = require("../ReactionMenu.js")

module.exports = class ServersCommand extends Command {
    constructor(client) {
        super(client, {
          name: 'servers',
          aliases: ['servs'],
          usage: 'servers',
          description: 'Displays a list of the servers Signal is in.',
          type: client.types.OWNER,
          ownerOnly: true,
          examples: ['servers', 'servs'],
          clientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
          guilds: ["789215359878168586"]
        });
      }
      async run(message, args) {
        if(!this.checkPermissions(message, true)) return;
  
        const servers = message.client.guilds.cache.array().map(guild => {
          return `\`${guild.id}\` - **${guild.name}** - \`${guild.members.cache.size}\` members`;
        });

        const embed = new MessageEmbed()
        .setTitle(`${success} Server List`)
        .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(message.guild.me.displayHexColor);

        if(servers.length <= 10) {
          const range = (servers.length == 1) ? '[1]' : `[1 - ${servers.length}]`;
          message.reply({ embeds: [embed.setTitle(`Server List ${range}`).setDescription(servers.join('\n'))] })
        } else {
          let member = await message.guild.members.fetch(message.author.id)
          new ReactionMenu(message.client, message.channel, member, embed, servers)
        }
      };
    };