const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

/**
* Capitalize First Letter of String
* @param {string} string
*/
function capitalize(string) {
	if(typeof string !== 'string') return '';
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Cleans the text
 * @param {string} text
 */
function clean(text) {
	if (typeof text === 'string') {
		return text
			.replace(/`/g, `\`${String.fromCharCode(8203)}`)
			.replace(/@/g, `@${String.fromCharCode(8203)}`)
			.replace(/```/g, '\\`\\`\\`')
			.replace(/(?<=^|[^`])`(?=[^`]|$)/g, '\\`');
	}
	return text;
}

/**
 * Removes specifed array element
 * @param {Array} arr
 * @param {*} value
 */
function removeElement(arr, value) {
	const index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}

/**
 * Trims array down to specified size
 * @param {Array} arr
 * @param {int} maxLen
 */
function trimArray(arr, maxLen = 10) {
	if (arr.length > maxLen) {
		const len = arr.length - maxLen;
		arr = arr.slice(0, maxLen);
		arr.push(`and **${len}** more...`);
	}
	return arr;
}

/**
 * Trims joined array to specified size
 * @param {Array} arr
 * @param {int} maxLen
 * @param {string} joinChar
 */
function trimStringFromArray(arr, maxLen = 2048, joinChar = '\n') {
	let string = arr.join(joinChar);
	const diff = maxLen - 15;
	if (string.length > maxLen) {
		string = string.slice(0, string.length - (string.length - diff));
		string = string.slice(0, string.lastIndexOf(joinChar));
		string = string + `\nAnd **${arr.length - string.split('\n').length}** more...`;
	}
	return string;
}

/**
 * Gets current array window range
 * @param {Array} arr
 * @param {int} current
 * @param {int} interval
 */
function getRange(arr, current, interval) {
	const max = (arr.length > current + interval) ? current + interval : arr.length;
	current = current + 1;
	const range = (arr.length == 1 || arr.length == current || interval == 1) ? `[${current}]` : `[${current} - ${max}]`;
	return range;
}

/**
 * Gets the ordinal numeral of a number
 * @param {int} number
 */
function getOrdinalNumeral(number) {
	number = number.toString();
	if (number === '11' || number === '12' || number === '13') return number + 'th';
	if (number.endsWith(1)) return number + 'st';
	else if (number.endsWith(2)) return number + 'nd';
	else if (number.endsWith(3)) return number + 'rd';
	else return number + 'th';
}

/**
 * Gets the next moderation case number
 * @param {Client} client
 * @param {Guild} guild
 */
function getCaseNumber(client, guild) {
	return parseInt(client.db.get(`case-${guild.id}`) ?? 0) + 1;
}

/**
 * Gets current status
 * @param {...*} args
 */
function getStatus(...args) {
	for (const arg of args) {
		if (!arg) return 'Disabled';
	}
	return 'Enabled';
}

/**
 * Surrounds welcome/farewell message keywords with backticks
 * @param {string} message
 */
function replaceKeywords(message) {
	if (!message) {return message;}
	else {
		return message
			.replace(/\?member/g, '`?member`')
			.replace(/\?username/g, '`?username`')
			.replace(/\?tag/g, '`?tag`')
			.replace(/\?size/g, '`?size`');
	}
}

/**
 * Sleeps for the specified number of ms
 * @param {int} ms
 * @returns {Promise}
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a confirmation box
 * @param {Message} message
 * @param {string} content
 * @returns {Promise}
 */
async function confirmation(message, content, authorID) {
	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('yes')
				.setLabel('Yes')
				.setStyle('SUCCESS'),
			new MessageButton()
				.setCustomId('no')
				.setLabel('No')
				.setStyle('DANGER'),
		);

	const embed = new MessageEmbed()
		.setTitle(':exclamation: Confirmation')
		.setFooter(`This will expire in 10 Seconds • ${message.member.displayName}`, message.author?.displayAvatarURL({ dynamic: true }) || message.user?.displayAvatarURL({ dynamic: true }))
		.setTimestamp()
		.setDescription(content)
		.setColor(message.guild.me.displayHexColor);

	const msg = await message.reply({ embeds: [embed], components: [row] });

	const collector = msg.channel.createMessageComponentCollector((i) => (i.customID === 'yes' || i.customID === 'no') && i.user.id === authorID, { time: 10000 });

	return new Promise((resolve) => {
		collector.on('collect', async (i) => {
			switch (i.customId) {
			case 'yes':
				i.update({ embeds: [embed], components: [] });
				resolve(true);
				break;
			case 'no':
				i.update({ embeds: [embed], components: [] });
				resolve(false);
				break;
			}
		});

		collector.on('end', collected => {
			if(collected.size < 1) resolve(false);
		});
	});
}

/**
 * Creates a confirmation box
 * @param {CommandInteraction} interaction
 * @param {string} content
 * @returns {Promise}
 */
async function slashConfirmation(interaction, content, authorID) {
	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('yes')
				.setLabel('Yes')
				.setStyle('SUCCESS'),
			new MessageButton()
				.setCustomId('no')
				.setLabel('No')
				.setStyle('DANGER'),
		);

	const embed = new MessageEmbed()
		.setTitle(':exclamation: Confirmation')
		.setFooter(`This will expire in 10 Seconds • ${interaction.member.displayName}`, interaction.user?.displayAvatarURL({ dynamic: true }) || interaction.user?.displayAvatarURL({ dynamic: true }))
		.setTimestamp()
		.setDescription(content)
		.setColor(interaction.guild.me.displayHexColor);

	await interaction.reply({ embeds: [embed], components: [row] });

	const collector = interaction.channel.createMessageComponentCollector((i) => (i.customID === 'yes' || i.customID === 'no') && i.user.id === authorID, { time: 10000 });

	return new Promise((resolve) => {
		collector.on('collect', async (i) => {
			switch (i.customId) {
			case 'yes':
				i.update({ embeds: [embed], components: [] });
				resolve(true);
				break;
			case 'no':
				i.update({ embeds: [embed], components: [] });
				resolve(false);
				break;
			}
		});

		collector.on('end', collected => {
			if(collected.size < 1) resolve(false);
		});
	});
}

/**
 * Unbans the User Specified
 * @param {Client} client
 * @param {Object} caseInfo
 */
async function unmute(client, caseInfo) {
	const guild = await client.guilds.fetch(caseInfo.guild);
	const member = await client.users.fetch(caseInfo.caseInfo.target);
	const moderator = await client.users.fetch(caseInfo.caseInfo.moderator);
	const role = client.db.get(`muterole-${guild.id}`) || guild.roles.cache.find(r => r.name.toLowerCase().replace(/[^a-z]/g, '') === 'muted');

	client.redis.del(`mute-${guild.id}-${caseInfo.caseInfo.caseID}`);

	try {
		const guildmember = await guild.members.fetch(member.id);
		guildmember.roles.remove(role.id);
	}
	catch(e) {
		// eslint disable-line
	}

	const embed = new MessageEmbed()
		.setTitle(`${require('./emojis.js').mod} Your Mute Expired (or was removed) in ${guild.name}`)
		.setFooter(`Case #${caseInfo.caseInfo.caseID} • ${moderator.tag}`, moderator.displayAvatarURL({ dynamic: true }))
		.setTimestamp()
		.setColor(guild.me.displayHexColor);

	member.send({ embeds: [embed] }).catch();
}

/**
 * Unbans the User Specified
 * @param {Client} client
 * @param {Object} caseInfo
 */
async function unban(client, caseInfo) {
	const guild = await client.guilds.fetch(caseInfo.guild);
	const member = await client.users.fetch(caseInfo.caseInfo.target);

	try {
		await guild.bans.fetch();
		await guild.bans.remove(member.id, 'Ban Revoked/Expired');
	}
	catch(e) {
		// eslint disable-line
	}
}

/**
 * Converts Milliseconds to Minutes and Seconds
 * @param {number} millis
 */
function millisToMinutesAndSeconds(millis) {
	const minutes = Math.floor(millis / 60000);
	const seconds = ((millis % 60000) / 1000).toFixed(0);
	return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

module.exports = {
	capitalize,
	clean,
	removeElement,
	trimArray,
	trimStringFromArray,
	getRange,
	getOrdinalNumeral,
	getCaseNumber,
	getStatus,
	replaceKeywords,
	sleep,
	confirmation,
	unmute,
	unban,
	millisToMinutesAndSeconds,
	slashConfirmation,
};
