const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { encode } = require('querystring');

const { misc } = require('../../utils/emojis.js');

const fetch = require('node-fetch');

const cache = new Map();

module.exports = class mdnCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'mdn',
			usage: 'mdn <search>',
			description: 'Allows you to search up something from MDN',
			type: client.types.MISC,
			examples: ['mdn string.prototype.replace'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async slashRun(interaction, args) {
		const query = args.get('search')?.value.trim();
		await interaction.defer({ ephemeral: true });

		try {
			const qString = `https://developer.mozilla.org/api/v1/search?${encode({ q: query })}`;
			let hit = cache.get(qString);

			if (!hit) {
				const result = await fetch(qString).then((r) => r.json());
				hit = result.documents?.[0];
				cache.set(qString, hit);
			}

			if (!hit) {
				return this.sendErrorMessage(interaction, 0, `No search result found for query ${query}`);
			}

			const url = `https://developer.mozilla.org/${hit.mdn_url}`;

			const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
			const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;
			const intro = hit.summary
				.replace(/\s+/g, ' ')
				.replace(linkReplaceRegex, '[$1](https://developer.mozilla.org/<$2>)')
				.replace(boldCodeBlockRegex, '**`$1`**');

			const parts = [`💻 __[**${hit.title}**](<${url}>)__`, intro];

			const embed = new SignalEmbed(interaction)
				.setTitle(`${misc} MDN Lookup 💻`)
				.setDescription(parts.join('\n'));

			interaction.editReply({ embeds: [embed], ephemeral: true });
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
				type: 'STRING',
				description: 'Search Term to provide to MDN',
				required: true,
			}],
		};
	}
};