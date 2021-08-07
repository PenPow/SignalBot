const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { oneLine, stripIndent } = require('common-tags');
const pkg = require(global.__basedir + '/package.json');
const { owner } = require('../../utils/emojis.js');

module.exports = class BotInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'botinfo',
			usage: 'botinfo',
			description: 'Fetches Signal\'s bot information.',
			type: client.types.INFO,
			examples: ['botinfo'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction) {
		const botOwner = await interaction.client.users.fetch(interaction.client.ownerId);
		const prefix = interaction.client.db.get(`${interaction.guild.id}_prefix`);
		const tech = stripIndent`
      Version     :: ${pkg.version}
      Library     :: Discord.js@dev
      Environment :: Node.js v14.17.3
      Database    :: SQLite
    `;
		const embed = new SignalEmbed(interaction)
			.setTitle('Signal\'s Bot Information')
			.setDescription(oneLine`
        Signal is an open source, fully customizable Discord bot that is constantly growing.
        Packaged with a variety of commands and 
        a multitude of settings that can be tailored to your server's specific needs, 
        the codebase also serves as a base framework to easily create Discord bots of all kinds.
      `)
			.addField('Prefix', `\`${prefix}\``, true)
			.addField('Client ID', `\`${interaction.client.user.id}\``, true)
			.addField(`Developer ${owner}`, `\`${botOwner.tag}\``, true)
			.addField('Tech', `\`\`\`asciidoc\n${tech}\`\`\``)
			.addField(
				'Links',
				'**[Invite Me](https://discord.com/oauth2/authorize?client_id=789809995478597642&scope=bot&permissions=498330710) | ' +
        '[Support Server](https://discord.gg/BGDyZMdvbw)**',
			)
			.setThumbnail(interaction.client.user.displayAvatarURL());

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};