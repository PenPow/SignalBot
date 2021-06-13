const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

const { fun } = require('../../utils/emojis.js');

const fetch = require('node-fetch');

module.exports = class CatFactCommand extends Command {
    constructor(client) {
        super(client, {
          name: 'catfact',
          usage: 'catfact',
          // aliases: ['catpic'],
          description: 'Finds a random cat fact',
          type: client.types.FUN,
          examples: ['catfact'],
          clientPermissions: ['EMBED_LINKS'],
          guilds: ['GLOBAL']
        });
      }
      async run(message, args) {
        try {
          const res = await fetch('https://catfact.ninja/fact');
          const fact = (await res.json()).fact;

          const embed = new MessageEmbed()
          .setTitle(`${fun} Cat Fact 🐈`)
          .setDescription(fact)
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
          const res = await fetch('https://catfact.ninja/fact');
          const fact = (await res.json()).fact;

          const embed = new MessageEmbed()
          .setTitle(`${fun} Cat Fact 🐈`)
          .setDescription(fact)
          .setFooter(interaction.member.displayName,  interaction.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(interaction.guild.me.displayHexColor);

          interaction.reply({ ephemeral: true, embeds: [embed] });
        } catch(err) {
          interaction.client.logger.error(err.stack);
          this.sendSlashErrorMessage(message, 1, 'Please try again in a few seconds', err.message);
        }
      }
};