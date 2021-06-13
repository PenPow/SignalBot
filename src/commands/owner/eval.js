const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success, fail } = require("../../utils/emojis");

module.exports = class EvalCommand extends Command {
    constructor(client) {
        super(client, {
          name: 'eval',
          usage: 'eval <code>',
          aliases: ["eval", "run", "exec", "execute"],
          description: 'Executes the provided code and shows output.',
          type: client.types.OWNER,
          ownerOnly: true,
          examples: ['eval 1 + 1', 'run console.log("This is Signal")', 'exec message.delete()', 'execute 2 + 2'],
          clientPermissions: ['EMBED_LINKS'],
          guilds: ["789215359878168586"]
        });
      }
      async run(message, args) {
        const input = args.join(' ')
        if (!input) return this.sendErrorMessage(message, 0, 'Please provide code to eval');
  
        const embed = new MessageEmbed();

        let output;
  
        try {
          output = eval(input);
          if (typeof output !== 'string') output = require('util').inspect(output, { depth: 0 });
          
          embed
            .addField(`Input`, `\`\`\`js\n${input.length > 1024 ? 'Too large to display.' : input}\`\`\``)
            .addField(`${success} Output`, `\`\`\`js\n${output.length > 1024 ? 'Too large to display.' : output}\`\`\``)
            .setColor('#66FF00');
  
        } catch(err) {
          embed
            .addField(`Input`, `\`\`\`js\n${input.length > 1024 ? 'Too large to display.' : input}\`\`\``)
            .addField(`${fail} Output`, `\`\`\`js\n${err.length > 1024 ? 'Too large to display.' : err}\`\`\``)
            .setColor('#FF0000');
        }

        if(output) if(output.includes(this.client.token)) return message.channel.send('(╯°□°)╯︵ ┻━┻ MY token. **MINE**.');
  
        message.reply({ embeds: [embed] });
      };
    };