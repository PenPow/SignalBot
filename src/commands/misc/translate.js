const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

const { misc } = require('../../utils/emojis.js');

const translate = require('@iamtraction/google-translate');

const langs = ['afrikaans', 'albanian', 'amharic', 'arabic', 'armenian', 'azerbaijani', 'bangla', 'basque', 'belarusian', 'bengali', 'bosnian', 'bulgarian', 'burmese', 'catalan', 'cebuano', 'chichewa', 'corsican', 'croatian', 'czech', 'danish', 'dutch', 'english', 'esperanto', 'estonian', 'filipino', 'finnish', 'french', 'frisian', 'galician', 'georgian', 'german', 'greek', 'gujarati', 'haitian creole', 'hausa', 'hawaiian', 'hebrew', 'hindi', 'hmong', 'hungarian', 'icelandic', 'igbo', 'indonesian', 'irish', 'italian', 'japanese', 'javanese', 'kannada', 'kazakh', 'khmer', 'korean', 'kurdish (kurmanji)', 'kyrgyz', 'lao', 'latin', 'latvian', 'lithuanian', 'luxembourgish', 'macedonian', 'malagasy', 'malay', 'malayalam', 'maltese', 'maori', 'marathi', 'mongolian', 'myanmar (burmese)', 'nepali', 'norwegian', 'nyanja', 'pashto', 'persian', 'polish', 'portugese', 'punjabi', 'romanian', 'russian', 'samoan', 'scottish gaelic', 'serbian', 'sesotho', 'shona', 'sindhi', 'sinhala', 'slovak', 'slovenian', 'somali', 'spanish', 'sundanese', 'swahili', 'swedish', 'tajik', 'tamil', 'telugu', 'thai', 'turkish', 'ukrainian', 'urdu', 'uzbek', 'vietnamese', 'welsh', 'xhosa', 'yiddish', 'yoruba', 'zulu'];

module.exports = class TranslateCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'translate',
			usage: 'translate <language> <text>',
			description: 'Translates text into another language',
			type: client.types.MISC,
			examples: ['translate french Hi!'],
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(interaction, args) {
		if(!langs.includes(args.get('language').value.toLowerCase())) return this.sendErrorMessage(interaction, 0, 'Please provide a valid language');

		const language = args.get('language').value.toLowerCase();
		const text = args.get('message').value;

		const translated = await translate(text, { to: language });

		const embed = new SignalEmbed(interaction)
			.setTitle(`${misc} Translated`)
			.setDescription(`${translated.from.language.iso} > ${language}`)
			.addField(translated.from.language.iso, '```' + text + '```')
			.addField(language, '```' + translated.text + '```');

		interaction.reply({ embeds: [embed], ephemeral: true });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'language',
				type: ApplicationCommandOptionType.String,
				description: 'Language to translate into',
				required: true,
			},
			{
				name: 'message',
				type: ApplicationCommandOptionType.String,
				description: 'Message to translate',
				required: true,
			}],
		};
	}
};