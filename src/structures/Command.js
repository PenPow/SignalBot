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
         * Aliases of the command
         * @type {Array<string>}
         */
		this.aliases = options.aliases || null;

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
         * If command can only be used by the owner
         * @type {boolean}
         */
		this.ownerOnly = Boolean(options.ownerOnly || false);

		/**
         * Whether the command is locked to certain guilds
         * @type {Array<string>}
         */
		this.guilds = options.guilds || ['GLOBAL'];

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
     * Runs the command
     * @param {Message} message
     * @param {Array<string>} args
     */
	run(message, args) { // eslint-disable-line
		throw new Error(`${this.name} has no run() method`);
	}

	/**
     * Runs the Slash Command Variant of the Command
     * @param {Interaction} interaction
     * @param {Array<options>} args
     */
	slashRun(interaction, args) { // eslint-disable-line
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
     * Gets member from mention
     * @param {Message} message
     * @param {string} mention
     */
	async getMemberFromMention(message, mention) {
		if(!mention) return null;
		const matches = mention.match(/^<@!?(\d+)>$/);

		if(!matches) return null;

		const id = matches[1];

		return await message.guild.members.fetch(id);
	}


	/**
     * Gets user from mention
     * @param {Message} message
     * @param {string} mention
     */
	async getUserFromMention(message, mention) {
		if(!mention) return null;
		const matches = mention.match(/^<@!?(\d+)>$/);

		if(!matches) return null;

		const id = matches[1];

		return await message.client.users.fetch(id);
	}
	/**
     * Gets a role from a mention
     * @param {Message} message
     * @param {string} mention
     */
	async getRoleFromMention(message, mention) {
		if(!mention) return null;
		const matches = mention.match(/^<@&(\d+)>$/);

		if(!matches) return null;

		const id = matches[1];

		return await message.guild.roles.fetch(id);
	}

	/**
     * Gets a channel from a mention
     * @param {Message} message
     * @param {string} mention
     */
	async getChannelFromMention(message, mention) {
		if(!mention) return null;
		const matches = mention.match(/^<#(\d+)>$/);

		if(!matches) return null;

		const id = matches[1];

		return await message.guild.channels.cache.get(id);
	}

	/**
     * Helper Method to check permissions
     * @param {Message} message
     * @param {boolean} ownerOverride
     */
	checkPermissions(message, ownerOverride = true) {
		if(!message.channel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return false;

		const clientPermission = this.checkClientPermissions(message);
		const userPermission = this.checkUserPermissions(message, ownerOverride);

		if(clientPermission && userPermission) return true;
		else return false;
	}

	/**
     * Checks the user permissions
     * Code modified from: https://github.com/discordjs/Commando/blob/master/src/commands/base.js
     * @param {Message} message
     * @param {boolean} ownerOverride
     */
	checkUserPermissions(message, ownerOverride = true) {
		if(!this.ownerOnly && !this.userPermissions) return true;
		if(ownerOverride && this.client.isOwner(message.author)) return true;

		if(this.ownerOnly && !this.client.isOwner(message.author)) return false;

		if(message.guild.members.cache.get(message.author.id).permissions.has('ADMINISTRATOR')) return true;
		if(this.userPermissions !== null) {
			const missingPermissions = message.channel.permissionsFor(message.author).missing(this.userPermissions).map(p => permissions[p]);
			if(missingPermissions.length !== 0) {
				const embed = new SignalEmbed(message)
					.setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
					.setTitle(`${fail} Missing User Permissions`)
					.setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``);

				message.reply({ embeds: [embed] });
				return false;
			}
		}

		return true;
	}

	/**
     * Checks the user permissions (Slash Commands)
     * Code modified from: https://github.com/discordjs/Commando/blob/master/src/commands/base.js
     * @param {Message} message
     * @param {boolean} ownerOverride
     */
	checkSlashUserPermissions(message, ownerOverride = true) {
		if(!this.ownerOnly && !this.userPermissions) return true;
		if(ownerOverride && this.client.isOwner(message.user)) return true;

		if(this.ownerOnly && !this.client.isOwner(message.author)) return false;

		if(message.guild.members.cache.get(message.user.id).permissions.has('ADMINISTRATOR')) return true;
		if(this.userPermissions !== null) {
			const missingPermissions = message.channel.permissionsFor(message.user).missing(this.userPermissions).map(p => permissions[p]);
			if(missingPermissions.length !== 0) {
				const embed = new SignalEmbed(message)
					.setAuthor(`${message.user.tag}`, message.user.displayAvatarURL({ dynamic: true }))
					.setTitle(`${fail} Missing User Permissions`)
					.setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``);

				message.reply({ ephemeral: true, embeds: [embed] });
				return false;
			}
		}

		return true;
	}

	/**
     * Checks the Client Permissions
     * @param {Message} message
     */
	checkClientPermissions(message) {
		const missingPermissions = message.channel.permissionsFor(message.guild.me).missing(this.clientPermissions).map(p => permissions[p]);
		if(missingPermissions.length !== 0) {
			const embed = new SignalEmbed(message)
				.setAuthor(`${this.client.user.tag}`, message.client.user.displayAvatarURL({ dynamic: true }))
				.setTitle(`${fail} Missing Bot Permissions`)
				.setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``);

			message.reply({ embeds: [embed] });
			return false;
		}
		else {return true;}
	}

	/**
     * Creates and sends command failure embed
     * @param {Message} message
     * @param {int} errorType
     * @param {string} reason
     * @param {string} errorMessage
     * @param {boolean} fatal
     */
	sendErrorMessage(message, errorType, reason, errorMessage = null, fatal = false) {
		errorType = this.errorTypes[errorType];

		const prefix = message.client.db.get(`${message.guild.id}_prefix`) || message.client.prefix;

		const embed = new SignalEmbed(message)
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

		return message.reply({ embeds: [embed] });

	}

	/**
     * Creates and sends command failure embed (Slash Command)
     * @param {Message} message
     * @param {int} errorType
     * @param {string} reason
     * @param {string} errorMessage
     * @param {boolean} fatal
     */
	sendSlashErrorMessage(interaction, errorType, reason, errorMessage, fatal = false) {
		errorType = this.errorTypes[errorType];

		const embed = new SignalEmbed(interaction)
			.setDescription(`\`\`\`diff\n- ${errorType}\n+ ${reason}\`\`\``);

		if(fatal) {
			embed.setTitle(`${fail} Fatal Error`)
				.addField('Fatal Error', 'This is an error with Signal, please report it on the support discord');
		}

		else {
			embed.setTitle(`${fail} Error`)
				.addField('Usage', `\`/${this.usage}\``);

			if(this.examples) embed.addField('Examples', this.examples.map(e => `\`/${e}\``).join('\n'));
		}

		if(errorMessage) embed.addField('Error Message', `\`\`\`${errorMessage}\`\`\``);

		return interaction.replied ? interaction.followUp({ ephemeral: true, embeds: [embed] }) : interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	/**
     * Creates and Sends Mod Log Embed
     * @param {Message} message
     * @param {string} reason
	 * @param {User} target
     * @param {Object} fields
     */
	async sendModLogMessage(message, reason, target, action, fields = {}) {
		await message.guild.channels.fetch();
		const user = await message.client.users.fetch(target);
		const modLog = message.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');

		if(modLog && modLog.viewable && modLog.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
			const caseNumber = parseInt(message.client.utils.getCaseNumber(message.client, message.guild, modLog));
			const prefix = message.client.db.get(`${message.guild.id}_prefix`) || message.client.prefix;
			if(reason == '`No Reason Provided`' || !reason) reason = `Use \`${prefix}reason ${caseNumber} <...reason>\` to set the reason for this case.`;
			const embed = new SignalEmbed(message)
				.setFooter(`Case #${caseNumber}`)
				.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ dynamic: true }));

			switch(action) {

			case 'mute':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${message.client.utils.capitalize(this.name)}\`\n**Context:** [Link](${message.url})\n**Reason:** ${reason}`);
				embed.setColor('#ffcc00');
				break;

			case 'unmute':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${message.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#7ef31f');
				break;

			case 'unban':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${message.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#7ef31f');
				break;

			case 'ban':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${message.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#ff1a00');
				break;

			case 'kick':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${message.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#f98406');
				break;

			case 'softban':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${message.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#f98406');
				break;

			case 'default':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${message.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#ff1a00');
				break;
			}

			for(const field in fields) {
				embed.addField(field, fields[field], true);
			}

			const sentMessage = await modLog.send({ embeds: [embed] }).catch(err => message.client.logger.error(err.stack));

			return sentMessage.id;
		}
	}

	/**
     * Creates and Sends Mod Log Embed (Slash Command)
     * @param {CommandInteraction} interaction
     * @param {string} reason
	 * @param {User} target
     * @param {Object} fields
     */
	async sendSlashModLogMessage(interaction, reason, target, action, fields = {}) {
		await interaction.guild.channels.fetch();
		const user = await interaction.client.users.fetch(target);
		const modLog = interaction.guild.channels.cache.find(c => c.name.replace('-', '') === 'modlogs' || c.name.replace('-', '') === 'modlog' || c.name.replace('-', '') === 'logs' || c.name.replace('-', '') === 'serverlogs' || c.name.replace('-', '') === 'auditlog' || c.name.replace('-', '') === 'auditlogs');
		if(modLog && modLog.viewable && modLog.permissionsFor(interaction.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
			const caseNumber = parseInt(interaction.client.utils.getCaseNumber(interaction.client, interaction.guild, modLog));
			const prefix = interaction.client.db.get(`${interaction.guild.id}_prefix`) || interaction.client.prefix;
			if(reason == '`No Reason Provided`' || !reason) reason = `Use \`${prefix}reason ${caseNumber} <...reason>\` to set the reason for this case.`;
			const embed = new SignalEmbed(interaction)
				.setFooter(`Case #${caseNumber}`)
				.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.setAuthor(`${interaction.user.tag} (${interaction.user.id})`, interaction.user.displayAvatarURL({ dynamic: true }));
			switch(action) {

			case 'mute':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${interaction.client.utils.capitalize(this.name)}\`\n**Context:** *Not Avaliable due to Slash Command Usage*\n**Reason:** ${reason}`);
				embed.setColor('#ffcc00');
				break;

			case 'unmute':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${interaction.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#7ef31f');
				break;

			case 'unban':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${interaction.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#7ef31f');
				break;

			case 'ban':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${interaction.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#ff1a00');
				break;

			case 'kick':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${interaction.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#f98406');
				break;

			case 'softban':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${interaction.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#f98406');
				break;

			case 'default':
				embed.setDescription(`**Member:** \`${user.tag}\` (${user.id})\n**Action:** \`${interaction.client.utils.capitalize(this.name)}\`\n**Reason:** ${reason}`);
				embed.setColor('#ff1a00');
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

		if(options.aliases) {
			if(!Array.isArray(options.aliases) || options.aliases.some(alias => typeof alias !== 'string')) throw new TypeError('Aliases are not an array of strings');

			if(options.aliases.some(alias => alias !== alias.toLowerCase())) throw new RangeError('Aliases are not lowercase');

			for(const alias of options.aliases) {
				if(client.aliases.get(alias)) throw new ReferenceError(`Alias ${alias} already exists`);
			}
		}

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