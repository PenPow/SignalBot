const Command = require('../../structures/Command');
const { MessageAttachment } = require('discord.js');

module.exports = class ToBeContinuedCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tobecontinued',
			usage: 'tobecontinued [USER]',
			description: 'Image editor, defaults to you if no user is supplied',
			type: client.types.MISC,
			examples: ['tobecontinued 207198455301537793', 'tobecontinued', 'tobecontinued @PenPow'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async run(interaction, args) {
		const member = args.get('member')?.member;

		await interaction.defer();

		const buffer = await this.client.images.generate('tobecontinued', { url: member.user.displayAvatarURL({ format: 'png', size: 512 }) });
		const attachment = new MessageAttachment(buffer, 'tobecontinued.png');
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