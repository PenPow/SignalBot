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
 * @param {TextChannel} modLog
 */
async function getCaseNumber(client, guild, modLog) {

	const message = (await modLog.messages.fetch({ limit: 100 })).filter(m => m.member === guild.me &&
      m.embeds[0] &&
      m.embeds[0].type == 'rich' &&
      m.embeds[0].footer &&
      m.embeds[0].footer.text &&
      m.embeds[0].footer.text.startsWith('Case'),
	).first();

	if (message) {
		const footer = message.embeds[0].footer.text;
		const num = parseInt(footer.split('#').pop());
		if (!isNaN(num)) return num + 1;
	}

	return 1;
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
 * @param {integer} ms
 * @returns {Promise}
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
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
};