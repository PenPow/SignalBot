/* eslint-disable no-mixed-spaces-and-tabs */
const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const { inspect } = require('util');
const fetch = require('node-fetch');

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'eval',
			usage: 'eval <code>',
			aliases: ['eval', 'run', 'exec', 'execute'],
			description: 'Executes the provided code and shows output.',
			type: client.types.OWNER,
			ownerOnly: true,
			examples: [
				'eval 1 + 1',
				'run console.log("This is Signal")',
				'exec message.delete()',
				'execute 2 + 2',
			],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['789215359878168586'],
		});
	}
	async run(message, args) {
		try {
			const code = args.join(' ');
			let evaled = eval(`( async () => {
				return ${code}
			  })()`);
			const raw = evaled;
			let promise, output, bin, download, type, color;

			if (evaled instanceof Promise) {
				message.channel.startTyping();
				promise = await evaled
					.then((res) => {
						return { resolved: true, body: inspect(res, { depth: 0 }) };
					})
					.catch((err) => {
						return { rejected: true, body: inspect(err, { depth: 0 }) };
					});
			}

			if (typeof evaled !== 'string') {
				evaled = inspect(evaled, { depth: 0 });
			}

			if (promise) {
				output = this.client.utils.clean(promise.body);
			}
			else {
				output = this.client.utils.clean(evaled);
			}

			if (promise?.resolved) {
				color = 'GREEN';
				type = 'Promise (Resolved)';
			}
			else if (promise?.rejected) {
				color = 'RED';
				type = 'Promise (Rejected)';
			}
			else {
				color = 'GREY';
				type = (typeof raw).charAt(0).toUpperCase() + (typeof raw).slice(1);
			}

			const elapsed = Math.abs(Date.now() - message.createdTimestamp);
			const embed = new MessageEmbed()
				.setColor(color)
				.addField(
					'\\📥 Input',
					`\`\`\`js\n${truncate(this.client.utils.clean(code), 1000, '...')}\`\`\``,
				)
				.setFooter(
					[
						`Type: ${type}`,
						`Evaluated in ${elapsed}ms.`,
					].join('\u2000•\u2000'),
				);

			if (output.length > 1000) {
				await fetch('https://hastebin.com/documents', {
					method: 'POST',
					body: output,
					headers: { 'Content-Type': 'text/plain' },
				})
					.then((res) => res.json())
					.then((json) => { 
						bin = 'https://hastebin.com/' + json.key + '.js';
						download = 'https://hastebin.com/raw/' + json.key + '.js';
					})
					.catch(() => null);
			}

			message.channel.stopTyping();
			return message.reply({ embeds: [
				embed.addFields(
					[
						{
							name: '\\📤 Output',
							value:
                			output.length > 1000
                	? `\`\`\`fix\nExceeded 1000 characters\nCharacter Length: ${output.length}\`\`\``
                	: `\`\`\`js\n${output}\n\`\`\``,
						},
						{
							name: '\u200b',
							value: `[\`📄 View\`](${bin}) • [\`📩 Download\`](${download})`,
						},
					].splice(0, Number(output.length > 1000) + 1),
				),
			],
			},
			);
		}
		catch (err) {
			const stacktrace = joinArrayAndLimit(
				err.stack.split('\n'),
				900,
				'\n',
			);
			const value = [
				'```xl',
				stacktrace.text,
				stacktrace.excess ? `\nand ${stacktrace.excess} lines more!` : '',
				'```',
			].join('\n');

			message.channel.stopTyping();
			return message.reply({ embeds: [new MessageEmbed()
				.setColor('RED')
				.setFooter(
					[
						`${err.name}`,
						`Evaluated in ${Math.abs(
							Date.now() - message.createdTimestamp,
						)}ms.`,
					].join('\u2000•\u2000'),
				)
				.addFields([
					{
						name: '\\📥 Input',
						value: `\`\`\`js\n${truncate(
							this.client.utils.clean(args.join(' ')),
							1000,
							'\n...',
						)}\`\`\``,
					},
					{ name: '\\📤 Output', value },
				])] });
		}
	}
};

function truncate(str = '', length = 100, end = '...') {
	return String(str).substring(0, length - end.length) + (str.length > length ? end : '');
}

function joinArrayAndLimit(array = [], limit = 1000, connector = '\n') {
	return array.reduce((a, c, i) => a.text.length + String(c).length > limit
		? { text: a.text, excess: a.excess + 1 }
		: { text: a.text + (i ? connector : '') + String(c), excess: a.excess }
	, { text: '', excess: 0 });
}