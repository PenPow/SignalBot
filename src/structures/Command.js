const SignalEmbed = require('./SignalEmbed');
const permissions = require('../utils/permissions.json');
const { fail } = require('../utils/emojis');

/**
 * Signal's Custom Command Handler
 * Modified from https://github.com/discordjs/Commando/blob/master/src/commands/base.js
 * @class
 * @author Joshua Clements <josh@penpow.dev>
 * @description Custom Command Handler
 * @public
 */
class Command {
	/**
     * @param {Client} client
     * @param {Object} options
    */
	constructor(client, options) {
		this.constructor.validateOptions(client, options);

		/**
         * The Client
         * @type {Client}
         */
		this.client = client;

		/**
         * Name of the Command
         * @type {string}
         */
		this.name = options.name;

		/**
         * The Arguments for the Command
         * @type {string}
         */
		this.usage = options.usage || options.name;

		/**
         * Command Description
         * @type {string}
         */
		this.description = options.description || '';

		/**
         * Type of Command
         * @type {string}
         */
		this.type = options.type || client.types.MISC;

		/**
         * Client Permissions Needed
         * @type {Array<string>}
         */
		this.clientPermissions = options.clientPermissions || ['SEND_MESSAGES', 'EMBED_LINKS'];

		/**
         * User Permissions Needed
         * @type {Array<string>}
         */
		this.userPermissions = options.userPermissions || null;

		/**
         * Examples of how the command is used
         * @type {Array<string>}
         */
		this.examples = options.examples || null;

		/**
         * Whether the command is locked to guild channels only
         * @type {boolean}
         */
		this.guildOnly = Boolean(options.guildOnly || false);

		/**
         * If command is enabled
         * @type {boolean}
         */
		this.disabled = Boolean(options.disabled || false);

		/**
         * Array of error types
         * @type {Array<string>}
         */
		this.errorTypes = ['Invalid Argument', 'Command Failure', 'Invalid Usage'];
	}

	/**
     * Runs the Slash Command Variant of the Command
     * @param {Interaction} interaction
     * @param {Array<options>} args
     */
	run(interaction, args) { // eslint-disable-line
		throw new Error(`${this.name} has no slashRun() method`);
	}

	/**
     * Generates the Data Object Needed for Setting the Slash Command
     * @returns {Object} data
     */
	generateSlashCommand() {
		throw new Error(`${this.name} has no generateSlashCommand() method`);
	}

	/**
     * Helper Method to check permissions
     * @param {interaction} interaction
     * @param {boolean} ownerOverride
     */
	checkPermissions(interaction, ownerOverride = true) {
		if(!interaction.channel.permissionsFor(interaction.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return false;

		const clientPermission = this.checkClientPermissions(interaction);
		const userPermission = this.checkUserPermissions(interaction, ownerOverride);

		if(clientPermission && userPermission) return true;
		else return false;
	}

	/**
     * Checks the user permissions
     * Code modified from: https://github.com/discordjs/Commando/blob/master/src/commands/base.js
     * @param {interaction} interaction
     * @param {boolean} ownerOverride
     */
	checkUserPermissions(interaction, ownerOverride = true) {
		if(!this.ownerOnly && !this.userPermissions) return true;
		if(ownerOverride && this.client.isOwner(interaction.member)) return true;

		if(this.ownerOnly && !this.client.isOwner(interaction.member)) return false;

		if(interaction.guild.members.cache.get(interaction.member.id).permissions.has('ADMINISTRATOR')) return true;
		if(this.userPermissions !== null) {
			const missingPermissions = interaction.channel.permissionsFor(interaction.user).missing(this.userPermissions).map(p => permissions[p]);
			if(missingPermissions.length !== 0) {
				const embed = new SignalEmbed(interaction)
					.setAuthor(`${interaction?.user?.tag}`, interaction?.user?.displayAvatarURL({ dynamic: true }))
					.setTitle(`${fail} Missing User Permissions`)
					.setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``);

				interaction.reply({ embeds: [embed], ephemeral: true });
				return false;
			}
		}

		return true;
	}

	/**
     * Checks the Client Permissions
     * @param {interaction} interaction
     */
	checkClientPermissions(interaction) {
		const missingPermissions = interaction.channel.permissionsFor(interaction.guild.me).missing(this.clientPermissions).map(p => permissions[p]);
		if(missingPermissions.length !== 0) {
			const embed = new SignalEmbed(interaction)
				.setAuthor(`${this.client.user.tag}`, interaction.client.user.displayAvatarURL({ dynamic: true }))
				.setTitle(`${fail} Missing Bot Permissions`)
				.setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``);

			interaction.reply({ embeds: [embed], ephemeral: true });
			return false;
		}
		else { return true; }
	}

	/**
     * Creates and sends command failure embed
     * @param {interaction} interaction
     * @param {int} errorType
     * @param {string} reason
     * @param {string} errorMessage
     * @param {boolean} fatal
     */
	sendErrorMessage(interaction, errorType, reason, errorMessage = null, fatal = false) {
		errorType = this.errorTypes[errorType];

		const prefix = '/';

		const embed = new SignalEmbed(interaction)
			.setDescription(`\`\`\`diff\n- ${errorType}\n+ ${reason}\`\`\``);

		if(fatal) {
			embed.setTitle(`${fail} Fatal Error`)
				.addField('Fatal Error', 'This is an error with Signal, please report it on the support discord');
		}

		else {
			embed.setTitle(`${fail} Error`)
				.addField('Usage', `\`${prefix}${this.usage}\``);

			if(this.examples) embed.addField('Examples', this.examples.map(e => `\`${prefix}${e}\``).join('\n'));
		}

		if(errorMessage) embed.addField('Error Message', `\`\`\`${errorMessage}\`\`\``);

		if(interaction.deferred || interaction.replied) {interaction.followUp({ ephemeral: true, embeds: [embed] });}
		else { interaction.reply({ embeds: [embed], ephemeral: true }); }

		return;

	}

	/**
     * Creates and Sends Mod Log Embed
     * @param {interaction} interaction
     * @param {string} reason
	 * @param {User} target
	 * @param {number} exipration
     * @param {Object} fields
     */
	async sendModLogMessage(interaction, reason, target, action, caseNumber, expiration = null, reference = null, fields = {}) {
		await interaction.guild.channels.fetch();

		let user;
		try {
			user = await interaction.client.users.fetch(target);
		}
		// eslint-disable-next-line no-empty
		catch(e) {

		}
		const modLog = interaction.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');

		if(modLog && modLog.viewable && modLog.permissionsFor(interaction.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
			let reply = null;
			if(interaction.replied) reply = await interaction.fetchReply();

			if(reason == '`No Reason Provided`' || !reason) reason = `Use \`/reason ${caseNumber} <...reason>\` to set the reason for this case.`;
			const embed = new SignalEmbed()
				.setFooter(`Case #${caseNumber}`)
				.setThumbnail(user?.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
				.setColor(interaction.guild.me.displayHexColor);

			try {
				embed.setAuthor(`${interaction?.user?.tag} (${interaction?.user?.id})`, interaction?.user?.displayAvatarURL({ dynamic: true }) || 'https://ss.penpow.dev/i/Signal.png');
			}
			catch {
				embed.setAuthor(`${interaction?.user?.tag} (${interaction?.user?.id})`, 'https://ss.penpow.dev/i/Signal.png');
			}
			switch(action) {

			case 'mute':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** ${interaction.client.utils.capitalize(this.name)}${expiration ? `\n**Expiration** <t:${parseInt(expiration / 1000).toFixed(0)}:R>` : ''}${reply ? `\n**Context:** [Link](${reply?.url})` : ''}\n**Reason:** ${reason}${reference.url ? `\n**Reference:** [#${reference.caseId}](${reference.url})` : ''}`);
				embed.setColor('#FFDB5C');
				break;

			case 'warn':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** ${interaction.client.utils.capitalize(this.name)}${reply ? `\n**Context:** [Link](${reply?.url})` : ''}\n**Reason:** ${reason}${reference.url ? `\n**Reference:** [#${reference.caseId}](${reference.url})` : ''}`);
				embed.setColor('#FFDB5C');
				break;

			case 'unmute':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** ${interaction.client.utils.capitalize(this.name)}\n**Reason:** ${reason}${reference.url ? `\n**Reference:** [#${reference.caseId}](${reference.url})` : ''}`);
				embed.setColor('#5CFF9D');
				break;

			case 'unban':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** ${interaction.client.utils.capitalize(this.name)}\n**Reason:** ${reason}${reference.url ? `\n**Reference:** [#${reference.caseId}](${reference.url})` : ''}`);
				embed.setColor('#5CFF9D');
				break;

			case 'ban':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** ${interaction.client.utils.capitalize(this.name)}${expiration ? `\n**Expiration:** <t:${parseInt(expiration / 1000).toFixed(0)}:R>` : '' }\n**Reason:** ${reason}${reference.url ? `\n**Reference:** [#${reference.caseId}](${reference.url})` : ''}`);
				embed.setColor('#FF5C5C');
				break;

			case 'kick':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** ${interaction.client.utils.capitalize(this.name)}${expiration ? `\n**Expiration** <t:${parseInt(expiration / 1000).toFixed(0)}:R>` : ''}\n**Reason:** ${reason}${reference.url ? `\n**Reference:** [#${reference.caseId}](${reference.url})` : ''}`);
				embed.setColor('#FFDB5C');
				break;

			case 'softban':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** ${interaction.client.utils.capitalize(this.name)}\n**Reason:** ${reason}${reference.url ? `\n**Reference:** [#${reference.caseId}](${reference.url})` : ''}`);
				embed.setColor('#F79454');
				break;

			case 'slowmode':
				embed.setDescription(`**Channel:** <#${target}> (${target})\n**Action:** ${interaction.client.utils.capitalize(this.name)}\n**Reason:** ${reason}${reference.url ? `\n**Reference:** [#${reference.caseId}](${reference.url})` : ''}`);
				embed.setColor('#5C6CFF');
				break;

			case 'auto':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** Remove Punishment\n**Reason:** Automatic unrole based on duration\n**Reference:** [#${reference.caseId}](${reference.url})`);
				embed.setColor();
				break;
			}

			for(const field in fields) {
				embed.addField(field, fields[field], true);
			}

			const sentMessage = await modLog.send({ embeds: [embed] }).catch(err => interaction.client.logger.error(err.stack));

			return sentMessage.id;
		}
	}

	/**
     * Validates Command Options
     * Code modified from: https://github.com/discordjs/Commando/blob/master/src/commands/base.js
     * @param {Client} client
     * @param {Object} options
     * @static
     */
	static validateOptions(client, options) {
		if(!client) throw new Error('No client was found');

		if(typeof options !== 'object') throw new TypeError('Options is not an Object');

		if(typeof options.name !== 'string') throw new TypeError('Command name is not a string');
		if(options.name !== options.name.toLowerCase()) throw new Error('Command name is not lowecase');

		if(client.commands.get(options.name)) throw new ReferenceError(`Command ${options.name} already exists`);

		if(options.usage && typeof options.usage !== 'string') throw new TypeError('Command Usage is not a string');

		if(options.description && typeof options.description !== 'string') throw new TypeError('Command Description is not a string');

		if(options.type && typeof options.type !== 'string') throw new TypeError('Command type is not a string');
		if(options.type && !Object.values(client.types).includes(options.type)) throw new Error('Command Type does not exist');

		if(options.clientPermissions) {
			if(!Array.isArray(options.clientPermissions)) throw new TypeError('Client Permissions is not an array of strings');

			for(const perm of options.clientPermissions) {
				if(!permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
			}
		}

		if(options.userPermissions) {
			if(!Array.isArray(options.userPermissions)) throw new TypeError('User Permissions is not an array of strings');

			for(const perm of options.userPermissions) {
				if(!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
			}
		}

		if(options.examples && !Array.isArray(options.examples)) throw new TypeError('Examples are not an array');

		if(options.ownerOnly && typeof options.ownerOnly !== 'boolean') throw new TypeError('Command ownerOnly is not a boolean');

		if (options.disabled && typeof options.disabled !== 'boolean') throw new TypeError('Command disabled is not a boolean');

		if(options.errorTypes && !Array.isArray(options.errorTypes)) throw new TypeError('Error types are not an array');
		if(options.guilds && !Array.isArray(options.guilds)) throw new TypeError('Guilds are not an array');
	}
}

module.exports = Command;