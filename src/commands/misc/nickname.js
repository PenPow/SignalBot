const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require("../../utils/emojis");

module.exports = class NicknameCommand extends Command {
    constructor(client) {
        super(client, {
          name: 'nickname',
          usage: 'nickname <nickname>',
          aliases: ["changenickname", "nick", "nn"],
          description: 'Changes your own nickname to the one specified. The nickname cannot be larger than 32 characters.',
          type: client.types.MISC,
          examples: ['nickname Jeff Bezos', 'changenickname Mike', 'nick Joe Biden', 'nn Trump'],
          clientPermissions: ['EMBED_LINKS', 'MANAGE_NICKNAMES'],
          userPermissions: ['CHANGE_NICKNAME', 'MANAGE_NICKNAMES'],
          guilds: ["GLOBAL"],
          arguments: [{
            name: "nickname",
            type: "STRING",
            description: "What do you want your nickname to be updated to",
            required: true,
          }],
        });
      }
      async run(message, args) {
        if (!args[0]) return this.sendErrorMessage(message, 0, 'Please provide a nickname');
        const nickname = message.content.slice(message.content.indexOf(args[0]), message.content.length);

        if (nickname.length > 32) return this.sendErrorMessage(message, 0, 'Please ensure the nickname is no larger than 32 characters');
        else if(message.author.id === message.guild.ownerID) return this.sendErrorMessage(message, 1, 'Unable to change the nickname of server owner');
        else {
          try {
            const oldNickname = message.member.nickname || '`None`';
            const nicknameStatus = `${oldNickname} ➔ ${nickname}`;
            await message.member.setNickname(nickname);
            const embed = new MessageEmbed()
            .setTitle(`${success} Change Nickname`)
            .setDescription(`${message.member}'s nickname was successfully updated.`)
            .addField('Member', message.member, true)
            .addField('Nickname', nicknameStatus, true)
            .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setColor(message.guild.me.displayHexColor);

            message.reply(embed);
          } catch (err) {
            this.sendErrorMessage(message, 1, 'Please check the role hierarchy', err.message);
          }
        }
      };

      async slashRun(interaction, args) {
        const nickname = args[0].value;

        if (nickname.length > 32) return this.sendSlashErrorMessage(interaction, 0, 'Please ensure the nickname is no larger than 32 characters');
        else if(interaction.user.id === interaction.guild.ownerID) return this.sendSlashErrorMessage(interaction, 1, 'Unable to change the nickname of server owner');
        else {
          try {
            const oldNickname = interaction.member.nickname || '`None`';
            const nicknameStatus = `${oldNickname} ➔ ${nickname}`;
            await interaction.member.setNickname(nickname);
            const embed = new MessageEmbed()
            .setTitle(`${success} Change Nickname`)
            .setDescription(`${interaction.member}'s nickname was successfully updated.`)
            .addField('Member', interaction.member, true)
            .addField('Nickname', nicknameStatus, true)
            .setFooter(interaction.member.displayName,  interaction.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setColor(interaction.guild.me.displayHexColor);

            interaction.reply({ ephemeral: true, embeds: [embed] });
          } catch (err) {
            this.sendSlashErrorMessage(interaction, 1, 'Please check the role hierarchy', err.message);
          }
        }
      }
    };