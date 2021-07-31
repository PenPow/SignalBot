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