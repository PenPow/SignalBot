const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const pkg = require(__basedir + '/package.json');
const { owner } = require('../../utils/emojis.js');
const { oneLine, stripIndent } = require('common-tags');

module.exports = class BotInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'botinfo',
      aliases: ['bot', 'bi'],
      usage: 'botinfo',
      description: 'Fetches Signal\'s bot information.',
      type: client.types.INFO,
      guilds: ["GLOBAL"],
      examples: ['botinfo', 'bot', 'bi'],
      clientPermissions: ['EMBED_LINKS'],
    });
  }
  async run(message, args) {
    const botOwner = await message.client.users.fetch(message.client.ownerId);
    const prefix = message.client.db.get(`${message.guild.id}_prefix`);
    const tech = stripIndent`
      Version     :: ${pkg.version}
      Library     :: Discord.js Master Branch
      Environment :: Node.js v14.15.2
      Database    :: SQLite
    `;
    const embed = new MessageEmbed()
      .setTitle('Signal\'s Bot Information')
      .setDescription(oneLine`
        Signal is an open source, fully customizable Discord bot that is constantly growing.
        Packaged with a variety of commands and 
        a multitude of settings that can be tailored to your server's specific needs, 
        the codebase also serves as a base framework to easily create Discord bots of all kinds.
      `)
      .addField('Prefix', `\`${prefix}\``, true)
      .addField('Client ID', `\`${message.client.user.id}\``, true)
      .addField(`Developer ${owner}`, botOwner, true)
      .addField('Tech', `\`\`\`asciidoc\n${tech}\`\`\``)
      .addField(
        'Links', 
        '**[Invite Me](https://discord.com/oauth2/authorize?client_id=789809995478597642&scope=bot&permissions=498330710) | ' +
        '[Support Server](https://discord.gg/BGDyZMdvbw)**'
      )
      .setThumbnail(message.client.user.displayAvatarURL())
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    message.channel.send(embed);
  };

  async slashRun(interaction, args) {
    const botOwner = await interaction.client.users.fetch(interaction.client.ownerId);
    const prefix = interaction.client.db.get(`${interaction.guild.id}_prefix`);
    const tech = stripIndent`
      Version     :: ${pkg.version}
      Library     :: Discord.js Master Branch
      Environment :: Node.js v14.15.2
      Database    :: SQLite
    `;
    const embed = new MessageEmbed()
      .setTitle('Signal\'s Bot Information')
      .setDescription(oneLine`
        Signal is an open source, fully customizable Discord bot that is constantly growing.
        Packaged with a variety of commands and 
        a multitude of settings that can be tailored to your server's specific needs, 
        the codebase also serves as a base framework to easily create Discord bots of all kinds.
      `)
      .addField('Prefix', `\`${prefix}\``, true)
      .addField('Client ID', `\`${interaction.client.user.id}\``, true)
      .addField(`Developer ${owner}`, botOwner, true)
      .addField('Tech', `\`\`\`asciidoc\n${tech}\`\`\``)
      .addField(
        'Links', 
        '**[Invite Me](https://discord.com/oauth2/authorize?client_id=789809995478597642&scope=bot&permissions=498330710) | ' +
        '[Support Server](https://discord.gg/BGDyZMdvbw)**'
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter(interaction.member.displayName,  interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(interaction.guild.me.displayHexColor);
    interaction.reply({ ephemeral: true, embeds: [embed] });
  }
};