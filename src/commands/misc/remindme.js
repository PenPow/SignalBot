const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const ms = require('ms');
const { success } = require('../../utils/emojis');

module.exports = class ReminderCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'remindme',
			usage: 'remindme <time> <message>',
			description: 'Sets a reminder for you, time can be in hours, minutes, seconds, days, or years.',
			type: client.types.MISC,
			examples: ['remindme 2h go to the shops'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
		});
	}

	async run(interaction, args) {
		const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
		if (isNaN(ms(args.get('time')?.value))) return this.sendErrorMessage(interaction, 0, 'Please provide a valid time');
		const time = args.get('time')?.value;
		const msg = args.get('message')?.value;

		const uuid = genRanHex(6);

		const rData = {
			user: interaction.user.id,
			uuid: uuid,
			message: msg,
			createdAt: (new Date(Date.now()).getTime() / 1000).toFixed(0),
			expireAt: (new Date(Date.now()).getTime() / 1000).toFixed(0),
		};

		this.client.db.push('global_reminders', rData);
		this.client.db.set(`reminder_${uuid}`, rData);

		const embed = new SignalEmbed(interaction)
			.setTitle(`${success} Reminder Set`);

		const redisClient = this.client.redis;
		try {
			const redisKey = `reminder-${uuid}`;
			redisClient.set(redisKey, 'Reminder', 'EX', Math.round(ms(time) / 1000));
		}
		catch(e) {
			this.client.logger.error(e.stack);
		}

		interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'time',
				type: 'STRING',
				description: 'How long until I should send this reminder (s/m/h/d/w/m/y)',
				required: true,
			},
			{
				name: 'message',
				type: 'STRING',
				description: 'Message to attach to this reminder',
				required: true,
			}],
		};
	}
};