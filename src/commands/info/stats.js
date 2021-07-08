const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const { mem, cpu, os } = require('node-os-utils');
const { stripIndent } = require('common-tags');

module.exports = class StatsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'stats',
			usage: 'stats',
			aliases: ['statistics', 'metrics'],
			description: 'Fetches Signal\'s statistics.',
			type: client.types.INFO,
			examples: ['stats', 'statistics', 'metrics'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message) {
		const days = parseInt((this.client.uptime / (1000 * 60 * 60 * 24)) % 60) < 10 ? '0' + parseInt((this.client.uptime / (1000 * 60 * 60 * 24)) % 60) : parseInt((this.client.uptime / (1000 * 60 * 60 * 24)) % 60);
		const hours = parseInt((this.client.uptime / (1000 * 60 * 60)) % 24) < 10 ? '0' + parseInt((this.client.uptime / (1000 * 60 * 60)) % 24) : parseInt((this.client.uptime / (1000 * 60 * 60)) % 24);
		const minutes = parseInt((this.client.uptime / (1000 * 60)) % 60) < 10 ? '0' + parseInt((this.client.uptime / (1000 * 60)) % 60) : parseInt((this.client.uptime / (1000 * 60)) % 60);
		const clientStats = stripIndent`
		  Servers   :: ${message.client.guilds.cache.size}
		  Users     :: ${message.client.users.cache.size}
		  Channels  :: ${message.client.channels.cache.size}
		  WS Ping   :: ${Math.round(message.client.ws.ping)}ms
		  Uptime    :: ${days} days, ${hours} hours, and ${minutes} minutes
		`;
		const { totalMemMb, usedMemMb } = await mem.info();
		let platform = await os.oos();
		if(platform === 'not supported') platform = 'Windows 10';
		const serverStats = stripIndent`
		  OS        :: ${platform}
		  CPU       :: ${cpu.model()}
		  Cores     :: ${cpu.count()}
		  CPU Usage :: ${await cpu.usage()} %
		  RAM       :: ${totalMemMb} MB
		  RAM Usage :: ${(Math.round((usedMemMb / totalMemMb) * 1e4) / 1e2).toString()}%
		`;
		const embed = new MessageEmbed()
			.setTitle('Signal\'s Statistics')
			.addField('Commands', `\`${message.client.commands.size}\` commands`, true)
			.addField('Aliases', `\`${message.client.aliases.size}\` aliases`, true)
			.addField('Command Types', `\`${Object.keys(message.client.types).length}\` Command types`, true)
			.addField('Client', `\`\`\`asciidoc\n${clientStats}\`\`\``)
			.addField('Server', `\`\`\`asciidoc\n${serverStats}\`\`\``)
			.addField(
				'Links',
				'**[Invite Me](https://discord.com/oauth2/authorize?client_id=789809995478597642&scope=bot&permissions=498330710) | ' +
				'[Support Server](https://discord.gg/BGDyZMdvbw)**')
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);
		message.reply({ embeds: [embed] });
	}

	async slashRun(interaction) {
		const days = parseInt((interaction.client.uptime / (1000 * 60 * 60 * 24)) % 60) < 10 ? '0' + parseInt((this.client.uptime / (1000 * 60 * 60 * 24)) % 60) : parseInt((this.client.uptime / (1000 * 60 * 60 * 24)) % 60);
		const hours = parseInt((this.client.uptime / (1000 * 60 * 60)) % 24) < 10 ? '0' + parseInt((this.client.uptime / (1000 * 60 * 60)) % 24) : parseInt((this.client.uptime / (1000 * 60 * 60)) % 24);
		const minutes = parseInt((this.client.uptime / (1000 * 60)) % 60) < 10 ? '0' + parseInt((this.client.uptime / (1000 * 60)) % 60) : parseInt((this.client.uptime / (1000 * 60)) % 60);
		const clientStats = stripIndent`
		  Servers   :: ${interaction.client.guilds.cache.size}
		  Users     :: ${interaction.client.users.cache.size}
		  Channels  :: ${interaction.client.channels.cache.size}
		  WS Ping   :: ${Math.round(interaction.client.ws.ping)}ms
		  Uptime    :: ${days} days, ${hours} hours, and ${minutes} minutes
		`;
		const { totalMemMb, usedMemMb } = await mem.info();
		let platform = await os.oos();
		if(platform === 'not supported') platform = 'Windows 10';
		const serverStats = stripIndent`
		  OS        :: ${platform}
		  CPU       :: ${cpu.model()}
		  Cores     :: ${cpu.count()}
		  CPU Usage :: ${await cpu.usage()} %
		  RAM       :: ${totalMemMb} MB
		  RAM Usage :: ${(Math.round((usedMemMb / totalMemMb) * 1e4) / 1e2).toString()}%
		`;

		const embed = new MessageEmbed()
			.setTitle('Signal\'s Statistics')
			.addField('Commands', `\`${interaction.client.commands.size}\` commands`, true)
			.addField('Aliases', `\`${interaction.client.aliases.size}\` aliases`, true)
			.addField('Command Types', `\`${Object.keys(interaction.client.types).length}\` Command types`, true)
			.addField('Client', `\`\`\`asciidoc\n${clientStats}\`\`\``)
			.addField('Server', `\`\`\`asciidoc\n${serverStats}\`\`\``)
			.addField(
				'Links',
				'**[Invite Me](https://discord.com/oauth2/authorize?client_id=789809995478597642&scope=bot&permissions=498330710) | ' +
				'[Support Server](https://discord.gg/BGDyZMdvbw)**')
			.setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor);
		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
		};
	}
};