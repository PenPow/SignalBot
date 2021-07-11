const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis');

module.exports = class DeployCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'deploy',
			usage: 'deploy',
			description: 'Deploys Slash Commands to the global CDN',
			type: client.types.OWNER,
			ownerOnly: true,
			examples: ['deploy'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['789215359878168586'],
		});
	}
	async run(message) {
		const commandArray = [];

		this.client.commands.each(async command => {
			if(command.disabled) return;
			if(command.ownerOnly || command.type === this.client.types.OWNER) return;

			commandArray.push(command.generateSlashCommand());
		});

		const test_guild = await this.client.guilds.fetch('789215359878168586');
		test_guild.commands.set(commandArray);

		const embed = new MessageEmbed()
			.setTitle(`${success} Deployed Slashy Commands`)
			.setDescription('I have successfully deployed slash commands to the discord CDN')
			.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
			.setColor(message.guild.me.displayHexColor);

		message.reply({ embeds: [embed] });
	}
};