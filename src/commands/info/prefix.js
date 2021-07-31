const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			usage: 'prefix <new prefix>',
			aliases: ['pre'],
			description: 'Shows/sets the prefix for the server',
			type: client.types.INFO,
			examples: ['prefix', 'prefix s!', 'pre', 'pre s!'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async slashRun(interaction, args) {

		if(!interaction.member.permissions.has('ADMINISTRATOR') || !args.first()?.value) {
			const prefix = this.client.db.get(`${interaction.guild.id}_prefix`);
			const embed = new SignalEmbed(interaction)
				.setTitle(`Signal's Prefix for ${interaction.guild.name}`)
				.addField('Prefix', `\`${prefix}\``, true)
				.addField('Example', `\`${prefix}ping\``, true);
			return interaction.reply({ ephemeral: true, embeds: [embed] });
		}

		else {
			const prefix = this.client.db.get(`${interaction.guild.id}_prefix`);
			this.client.db.set(`${interaction.guild.id}_prefix`, args.first().value);

			const embed = new SignalEmbed(interaction)
				.setTitle(`Updated Prefix for ${interaction.guild.name}`)
				.addField('Prefix', `\`${prefix}\` ➔ \`${args.first().value}\``, true)
				.addField('Example', `\`${args.first().value}ping\``, true);
			return interaction.reply({ ephemeral: true, embeds: [embed] });
		}

	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'new_prefix',
				type: 'STRING',
				description: '(Optional) Sets the prefix for the guild (Administrator Only)',
				required: false,
			}],
		};
	}
};