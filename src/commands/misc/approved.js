const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { MessageAttachment } = require('discord.js');

module.exports = class ApprovedCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'approved',
			usage: 'approved [USER]',
			description: 'Image editor, defaults to you if no user is supplied',
			type: client.types.MISC,
			examples: ['approved 207198455301537793', 'approved', 'approved @PenPow'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}
	async run(message, args) {
		let member;

		try {
			member = await this.getMemberFromMention(message, args[0]) || await message.guild.members.fetch(args[0]);
		}
		catch(e) {
			// eslint disable-line
		}

		const embed = new SignalEmbed(message)
			.setTitle('🔎 Searching!')
			.setDescription('Please note that this make take up to 5 seconds while we connect to the image gateway.');

		const m = await message.reply({ embeds: [embed] });

		if(!args[0]) member = message.member;

		const buffer = await this.client.images.generate('approved', { url: member.user.displayAvatarURL({ format: 'png', size: 512 }) });
		const attachment = new MessageAttachment(buffer, 'approved.png');
		m.delete();
		message.reply({ files: [attachment] });
	}

	async slashRun(interaction, args) {
		const member = args.get('member')?.member;

		await interaction.defer();

		const buffer = await this.client.images.generate('approved', { url: member.user.displayAvatarURL({ format: 'png', size: 512 }) });
		const attachment = new MessageAttachment(buffer, 'approved.png');
		interaction.editReply({ files: [attachment] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'member',
				type: 'USER',
				description: 'The member to generate the image for',
				required: true,
			}],
		};
	}
};