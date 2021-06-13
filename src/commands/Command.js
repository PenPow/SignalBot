const { MessageEmbed } = require('discord.js');
const permissions = require('../utils/permissions.json');
const { fail } = require("../utils/emojis");

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

        /**
         * Arguments for Slash Command
         * @type {Array<object>}
         */
        this.arguments = options.arguments || null;
    };

    /**
     * Runs the command
     * @param {Message} message
     * @param {Array<string>} args
     */
    run(message, args) {
        throw new Error(`${this.name} has no run() method`);
    };

    /**
     * 
     * @param {Interaction} interaction 
     * @param {Array<options>} args 
     */
    slashRun(interaction, args) {
        throw new Error(`${this.name} has no slashRun() method`);
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
    };

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
    };

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
    };

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
    };

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
                const embed = new MessageEmbed()
                .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle(`${fail} Missing User Permissions`)
                .setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``)
                .setTimestamp()
                .setColor(message.guild.me.displayHexColor);

                message.reply(embed);
                return false;
            };
        };

        return true;
    };

    /**
     * Checks the Client Permissions
     * @param {Message} message
     */
    checkClientPermissions(message) {
        const missingPermissions = message.channel.permissionsFor(message.guild.me).missing(this.clientPermissions).map(p => permissions[p]);
        if(missingPermissions.length !== 0) {
            const embed = new MessageEmbed()
            .setAuthor(`${this.client.user.tag}`, message.client.user.displayAvatarURL({ dynamic: true }))
            .setTitle(`${fail} Missing Bot Permissions`)
            .setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``)
            .setTimestamp()
            .setColor(message.guild.me.displayHexColor);

            message.reply(embed);
            return false;
        } else return true;
    };

    /**
     * Creates and sends command failure embed
     * @param {Message} message
     * @param {int} errorType
     * @param {string} reason
     * @param {string} errorMessage
     * @param {boolean} fatal
     */
    async sendErrorMessage(message, errorType, reason, errorMessage, fatal = false) {
        errorType = this.errorTypes[errorType];

        const prefix = message.client.db.get(`${message.guild.id}_prefix`) || message.client.prefix;

        const embed = new MessageEmbed()
        .setDescription(`\`\`\`diff\n- ${errorType}\n+ ${reason}\`\`\``)
        .setTimestamp()
        .setColor(message.guild.me.displayHexColor);

        if(fatal) {
            embed.setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
            .setTitle(`${fail} Fatal Error`)
            .addField(`Fatal Error`, 'This is an error with Signal, please report it on the support discord');
        }

        else {
            embed.setTitle(`${fail} Error`)
            .addField(`Usage`, `\`${prefix}${this.usage}\``);

            if(this.examples) embed.addField('Examples', this.examples.map(e => `\`${prefix}${e}\``).join('\n'));
        };

        if(errorMessage) embed.addField('Error Message', `\`\`\`${errorMessage}\`\`\``);

        return message.reply(embed);

    };

        /**
     * Creates and sends command failure embed (Slash Command)
     * @param {Message} message
     * @param {int} errorType
     * @param {string} reason
     * @param {string} errorMessage
     * @param {boolean} fatal
     */
     async sendSlashErrorMessage(interaction, errorType, reason, errorMessage, fatal = false) {
        errorType = this.errorTypes[errorType];
 
        const prefix = interaction.client.db.get(`${interaction.guild.id}_prefix`) || interaction.client.prefix;
 
        const embed = new MessageEmbed()
        .setDescription(`\`\`\`diff\n- ${errorType}\n+ ${reason}\`\`\``)
        .setTimestamp()
        .setColor(interaction.guild.me.displayHexColor);
 
        if(fatal) {
            embed.setAuthor(`${interaction.user.tag}`, interaction.user.displayAvatarURL({ dynamic: true }))
            .setTitle(`${fail} Fatal Error`)
            .addField(`Fatal Error`, 'This is an error with Signal, please report it on the support discord');
        }
 
        else {
            embed.setTitle(`${fail} Error`)
            .addField(`Usage`, `\`/${this.usage}\``);
 
            if(this.examples) embed.addField('Examples', this.examples.map(e => `\`/${e}\``).join('\n'));
        };
 
        if(errorMessage) embed.addField('Error Message', `\`\`\`${errorMessage}\`\`\``);
 
        return interaction.reply({ ephemeral: true, embeds: [embed] });
 
    };

    /**
     * Creates and Sends Mod Log Embed
     * @param {Message} message
     * @param {string} reason
     * @param {Object} fields
     */
    async sendModLogMessage(message, reason, fields = {}) {
        await message.guild.channels.fetch();
        const modLog = message.guild.channels.cache.find(channel => channel.name.toLowerCase().replace(/[^a-z]/gi, ''));

        if(modLog && modLog.viewable && modLog.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
            const caseNumber = await message.client.utils.getCaseNumber(message.client, message.guild, modLog);
            const prefix = message.client.db.get(`${message.guild.id}_prefix`) || message.client.prefix;

            if(reason === null) reason = `Use \`${prefix}reason ${caseNumber} <...reason>\` to set the reason for this case.`;
            const embed = new MessageEmbed()
            .setTitle(`Action: \`${message.client.utils.capitalize(this.name)}\``)
            .addField('Moderator', message.author.tag, true)
            .setFooter(`Case #${caseNumber}`)
            .setTimestamp()
            .setColor(message.guild.me.displayHexColor);

            for(const field in fields) {
                embed.addField(field, fields[field], true);
            }

            embed.addField('Reason', reason);
            let sentMessage = modLog.send(embed).catch(err => message.client.logger.error(err.stack));

            return {
                caseNumber: caseNumber,
                modLogMessage: sentMessage.id
            };
        };
    };

    /**
     * Validates Command Options
     * Code modified from: https://github.com/discordjs/Commando/blob/master/src/commands/base.js
     * @param {Client} client
     * @param {Object} options
     */
    static validateOptions(client, options) {
        if(!client) throw new Error('No client was found');

        if(typeof options !== 'object') throw new TypeError('Options is not an Object');

        if(typeof options.name !== 'string') throw new TypeError('Command name is not a string');
        if(options.name !== options.name.toLowerCase()) throw new Error('Command name is not lowecase');

        if(client.commands.get(options.name)) throw new ReferenceError(`Command ${options.name} already exists`);

        if(options.aliases) {
            if(!Array.isArray(options.aliases) || options.aliases.some(alias => typeof alias !== 'string'))  throw new TypeError('Aliases are not an array of strings');

            if(options.aliases.some(alias => alias !== alias.toLowerCase()))  throw new RangeError('Aliases are not lowercase');

            for(const alias of options.aliases) {
                if(client.aliases.get(alias)) throw new ReferenceError(`Alias ${alias} already exists`);
            };
        };

        if(options.usage && typeof options.usage !== 'string') throw new TypeError(`Command Usage is not a string`);

        if(options.description && typeof options.description !== 'string') throw new TypeError('Command Description is not a string');

        if(options.type && typeof options.type !== 'string')  throw new TypeError('Command type is not a string');
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

        if(options.examples && !Array.isArray(options.examples)) throw new TypeError(`Examples are not an array`);

        if(options.ownerOnly && typeof options.ownerOnly !== 'boolean') throw new TypeError('Command ownerOnly is not a boolean');

        if (options.disabled && typeof options.disabled !== 'boolean') throw new TypeError('Command disabled is not a boolean');

        if(options.errorTypes && !Array.isArray(options.errorTypes)) throw new TypeError('Error types are not an array');
        if(options.guilds && !Array.isArray(options.guilds)) throw new TypeError('Guilds are not an array');
    }
};

module.exports = Command;