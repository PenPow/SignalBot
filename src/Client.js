const Discord = require('discord.js');
const { readdir, readdirSync } = require('fs');
const { join, resolve } = require('path');
const Enmap = require("enmap");

const Command = require("./commands/Command.js");

const AsciiTable = require('ascii-table');

/**
 * Signal's Custom Discord Client
 * @extends Discord.Client
 * @class
 * @author Joshua Clements <josh@penpow.dev>
 * @description Custom Client
 * @public
 */
class Client extends Discord.Client {

    /**
     * Creates a new client
     * @param {Object} config
     * @param {ClientOptions} options
     */
    constructor(config, options = {}) {
        super(options);

        /**
         * Creates Logger
         * @type {Logger}
         */
        this.logger = require("consola");
        
        /**
         * Creates Database
         * @type {Enmap}
         */
        this.db = new Enmap({
            name: "database",
            persistent: true,
            fetchAll: true,
            autoFetch: true,
        });

        /**
         * Possible Command Types
         * @type {Object}
         */
        this.types = {
            INFO: 'info',
            FUN: 'fun',
            MISC: 'misc',
            MOD: 'mod',
            ADMIN: 'admin',
            OWNER: 'owner'
        };

        /**
         * Collection of Commands
         * @type {Collection<string, Command>}
         */
        this.commands = new Discord.Collection();

        /**
         * Collection of Aliases
         * @type {Collection<string, Command>}
         */
        this.aliases = new Discord.Collection();

        /**
         * Voice Channel Queue
         * @type {Collection<Guild_ID, Queue>}
         */
        this.queue = new Discord.Collection();

        /**
         * Discord Token
         * @type {string}
         */
        this.token = config.apiKeys.discord.token;

        /**
         * API Keys
         * @type {Object}
         */
        this.apiKeys = config.apiKeys;
        
        /**
         * Configuration
         * @type {Object}
         */
        this.config = require("../config.json");

        /**
         * Signal Owner ID
         * @type {string}
         */
        this.ownerId = config.configuration.ownerId;

        /**
         * Utility Functions
         * @type {Object}
         */
        this.utils = require("./utils/utils.js");

        this.logger.info('Initalizing...');
    };

    /**
     * Loads All Events
     * @param {string} path
     */
    loadEvents(path) {
        readdir(path, (err, files) => {
            if(err) this.logger.error(err);
            files = files.filter(f => f.split('.').pop() === 'js');
            if(files.length === 0) return this.logger.warn('No Events Found');
            this.logger.info(`Found ${files.length} event(s)...`);
            files.forEach(f => {
                const eventName = f.substring(0, f.indexOf('.'));
                const event = require(resolve(__basedir, join(path, f)));
                super.on(eventName, event.bind(null, this));
                delete require.cache[require.resolve(resolve(__basedir, join(path, f)))];
                // this.logger.success(`Loading Event: ${this.utils.capitalize(eventName)}`);
            });
        });

        return this;
    };

    /**
     * Loads all Commands
     * @param {string} path
     */
    loadCommands(path) {
        this.logger.info("Loading Commands...");
        let table = new AsciiTable('Commands');
        table.setHeading('File', 'Aliases', 'Type', 'Status');
        readdirSync(path).filter(f => !f.endsWith('.js')).forEach(dir => {
            const commands = readdirSync(resolve(__basedir, join(path, dir))).filter(f => f.endsWith('js'));
            commands.forEach(f => {
                const Command = require(resolve(__basedir, join(path, dir, f)));
                const command = new Command(this);
                if(command.name && !command.disabled) {
                    this.commands.set(command.name, command);

                    let aliases = '';
                    if(command.aliases) {
                        command.aliases.forEach(alias => {
                            this.aliases.set(alias, command);
                        });

                        aliases = command.aliases.join(', ');
                    };

                    // this.logger.success(`Loading Commmand: ${this.utils.capitalize(command.name)}`);

                    table.addRow(f, aliases, this.utils.capitalize(command.type), 'Pass');

                } else {
                    // this.logger.warn(`Failed to load ${f}`);

                    table.addRow(f, '', '', 'Fail');
                    return;
                };
            });
        });

        this.logger.info(`Command Load Status\n${table.toString()}`);
        return this;
    };

    /**
     * Check is user is the bot owner
     * @param {User} user
     */
    isOwner(user) {
        if(user.id === this.ownerId) return true;
        else return false;
    };

    /**
     * Checks if voice channel is same as user channel
     * @param {string} botVoiceChannel
     * @param {string} userVoiceChannel
     */
    checkVoiceChannel(botVoiceChannel, userVoiceChannel) {
        if(botVoiceChannel.id !== userVoiceChannel.id) return false;
        return true;
    };
};

/**
 * Exports Client Function
 * @exports Client
 */
module.exports = Client;