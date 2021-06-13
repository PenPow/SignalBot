const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

const { fun } = require('../../utils/emojis.js');

const rps = ['scissors','rock', 'paper'];
const res = ['Scissors :v:','Rock :fist:', 'Paper :raised_hand:'];

module.exports = class RPSCommand extends Command {
    constructor(client) {
        super(client, {
          name: 'rps',
          usage: 'rps <rock | paper | scissors>',
          // aliases: ['dice', 'r'],
          description: 'Play a game of rock–paper–scissors against Signal!',
          type: client.types.FUN,
          examples: ['rps rock'],
          clientPermissions: ['EMBED_LINKS'],
          guilds: ['GLOBAL'],
          arguments: [{
            name: "option",
            type: "STRING",
            description: "Rock, paper or scissors",
            required: true,
          }],
        });
      }
      run(message, args) {
        if(!args[0] || (args && !rps.includes(args[0].toLowerCase()))) return this.sendErrorMessage(message, 0, 'Please enter rock, paper, or scissors');

        const userChoice = rps.indexOf(args[0].toLowerCase());
        const botChoice = Math.floor(Math.random() * 3);

        let result;

        if(botChoice === userChoice) result = 'It\'s a draw!';
        else if(botChoice > userChoice || botChoice === 0 && userChoice === 2) result = '**Signal** wins!';
        else result = `<@${message.author.id}> wins!`;

        const embed = new MessageEmbed()
        .setTitle(`${fun} ${message.author.tag} vs Signal`)
        .addField('Your Choice:', res[userChoice], true)
        .addField('Signal\'s Choice', res[botChoice], true)
        .addField('Result', result, true)
        .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(message.guild.me.displayHexColor);

        message.reply(embed);
      };

      slashRun(interaction, args) {
        if(!args[0].value || (args && !rps.includes(args[0].value.toLowerCase()))) return this.sendSlashErrorMessage(interaction, 0, 'Please enter rock, paper, or scissors');

        const userChoice = rps.indexOf(args[0].value.toLowerCase());
        const botChoice = Math.floor(Math.random() * 3);

        let result;

        if(botChoice === userChoice) result = 'It\'s a draw!';
        else if(botChoice > userChoice || botChoice === 0 && userChoice === 2) result = '**Signal** wins!';
        else result = `<@${interaction.user.id}> wins!`;

        const embed = new MessageEmbed()
        .setTitle(`${fun} ${interaction.user.tag} vs Signal`)
        .addField('Your Choice:', res[userChoice], true)
        .addField('Signal\'s Choice', res[botChoice], true)
        .addField('Result', result, true)
        .setFooter(interaction.member.displayName,  interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(interaction.guild.me.displayHexColor);

        interaction.reply({ ephemeral: true, embeds: [embed] });
      }
};