const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

const { fun } = require('../../utils/emojis.js');

const fetch = require('node-fetch');

module.exports = class DuckCommand extends Command {
    constructor(client) {
        super(client, {
          name: 'duck',
          usage: 'duck',
          aliases: ['duckpic'],
          description: 'Finds a random duck to watch',
          type: client.types.FUN,
          examples: ['duck', 'duckpic'],
          clientPermissions: ['EMBED_LINKS'],
          guilds: ['GLOBAL']
        });
      }
      async run(message, args) {
        try {
          const res = await fetch('https://random-d.uk/api/v2/random');
          const img = (await res.json()).url;

          const embed = new MessageEmbed()
          .setTitle(`${fun} Quack! 🦆`)
          .setImage(img)
          .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(message.guild.me.displayHexColor);

          message.reply(embed)
        } catch(err) {
          message.client.logger.error(err.stack);
          this.sendErrorMessage(message, 1, 'Please try again in a few seconds', err.message);
        }
      };

      async slashRun(interaction, args) {
        try {
          const res = await fetch('https://random-d.uk/api/v2/random');
          const img = (await res.json()).url;

          const embed = new MessageEmbed()
          .setTitle(`${fun} Quack! 🦆`)
          .setImage(img)
          .setFooter(interaction.member.displayName,  interaction.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(interaction.guild.me.displayHexColor);

          interaction.reply({ ephemeral: true, embeds: [embed] });
        } catch(err) {
          interaction.client.logger.error(err.stack);
          this.sendSlashErrorMessage(interaction, 1, 'Please try again in a few seconds', err.message);
        }
      };
};