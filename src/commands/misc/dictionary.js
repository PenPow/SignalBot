const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');

const { misc } = require('../../utils/emojis.js');

const fetch = require('node-fetch');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

module.exports = class DictionaryCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dictionary',
			usage: 'dictionary <search>',
			description: 'Allows you to search up something from the Oxford Dictionary',
			type: client.types.MISC,
			examples: ['mdn string.prototype.replace'],
			clientPermissions: ['EMBED_LINKS'],

		});
	}

	async run(interaction, args) {
		const query = args.get('search')?.value.trim();
		await interaction.deferReply({ ephemeral: true });

		try {
			const qString = `https://api.dictionaryapi.dev/api/v2/entries/en_US/${query}`;
			let hit = this.client.cache.get(qString);

			if (!hit) {
				const result = await fetch(qString).then((r) => r.json());

				if(!Array.isArray(result)) { hit = undefined; }
				else {
					hit = result[0];
					this.client.cache.set(qString, hit);
				}
			}

			if (!hit) {
				return this.sendErrorMessage(interaction, 0, `No search result found for query ${query}`);
			}

			const embed = new SignalEmbed(interaction)
				.setTitle(`${misc} ${hit.word} 📖`)
				.addFields([
					{ name: 'Phonetic Pronounciation', value: `[${hit.phonetic}](http:${hit.phonetics[0].audio})` },
				]);

			if(hit.meanings) {
				embed.addFields([
					{ name: 'Form', value: this.client.utils.capitalize(hit.meanings[0].partOfSpeech) },
					{ name: 'Definition', value: hit.meanings[0].definitions[0].definition },
				]);
			}

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
				type: ApplicationCommandOptionType.String,
				description: 'Search Term',
				required: true,
			}],
		};
	}
};