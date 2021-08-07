const Command = require('../../structures/Command');

const fetch = require('node-fetch');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class DocsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'docs',
			usage: 'docs <search>',
			description: 'Allows you to search up something from the Discord.JS documentation',
			type: client.types.MISC,
			examples: ['docs CommandInteraction#reply'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction, args) {
		const query = args.get('search')?.value.trim();

		try {
			const qString = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(query)}`;
			let hit = this.client.cache.get(qString);

			if (!hit) {
				await interaction.deferReply({ ephemeral: true });
				hit = await (await fetch(qString)).json();

				this.client.cache.set(qString, hit);
			}

			if (!hit) {
				return this.sendErrorMessage(interaction, 0, `No search result found for query ${query}`);
			}

			interaction.deferred ? interaction.editReply({ embeds: [hit], ephemeral: true }) : interaction.reply({ embeds: [hit], ephemeral: true });
		}
		catch(err) {
			interaction.client.logger.error(err.stack);
			this.sendErrorMessage(interaction, 1, 'Please try again in a few seconds', err.message);
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'search',
				type: ApplicationCommandOptionType.String,
				description: 'Search Term to provide to MDN',
				required: true,
			}],
		};
	}
};