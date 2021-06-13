const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client, {
          name: 'avatar',
          usage: 'avatar [user]',
          aliases: ["profilepic", "pic", "av"],
          description: 'Displays a user\'s avatar (or your own, if no user is mentioned).',
          type: client.types.INFO,
          examples: ['avatar', 'profilepic @PenPow', 'pic @PenPow', 'av @PenPow'],
          clientPermissions: ['EMBED_LINKS'],
        //   userPermissions: ['CHANGE_NICKNAME'],
          guilds: ["GLOBAL"],
          arguments: [{
            name: "user",
            type: "USER",
            description: "(Optional) Gets the user's avatar, defaults to you if none is given.",
            required: false,
          }],
        });
      }
      async run(message, args) {
        const member =  this.getMemberFromMention(message, args[0]) || 
        message.guild.members.cache.get(args[0]) || 
        message.member;

        const embed = new MessageEmbed()
          .setTitle(`${member.displayName}'s Avatar`)
          .setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
          .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(member.displayHexColor);
        message.channel.send(embed);
      };

      async slashRun(interaction, args) {
        const member = interaction.guild.members.cache.get(args[0]?.value) || 
        interaction.member;

        const embed = new MessageEmbed()
          .setTitle(`${member.displayName}'s Avatar`)
          .setImage(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
          .setFooter(interaction.member.displayName,  interaction.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(interaction.displayHexColor);
          interaction.reply({ ephemeral: true, embeds: [embed] });
      };
};