const Command = require('../../structures/Command');
const SignalEmbed = require('../../structures/SignalEmbed');
const { store } = require('../../utils/emojis.js');

module.exports = class TagCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tag',
			usage: 'tag <create | list | show | delete | edit | guide>',
			aliases: ['tags'],
			description: 'Creates/Lists/Shows/Edits/Deletes a tag (run s!tags guide for more information)',
			type: client.types.TAG,
			examples: ['tag create', 'tag show', 'tag list', 'tag delete', 'tag edit', 'tag guide'],
			clientPermissions: ['EMBED_LINKS'],
			guilds: ['GLOBAL'],
			guildOnly: true,
		});
	}
	async run(message, args) {
		await this.client.db.ensure(`guild_tags_${message.guild.id}`, []);
		await this.client.db.ensure('guild_tags', []);
		if(!args[0]) return this.sendErrorMessage(message, 0, 'Please specify a sub command (create, show, delete, edit or guide)');
		if(!['create', 'edit', 'show', 'delete', 'guide', 'list'].includes(args[0].toLowerCase())) return this.sendErrorMessage(message, 0, 'Please specify a valid sub command (create, show, delete, edit or guide)');

		switch(args[0].toLowerCase()) {
		case 'guide': {
			const embed = new SignalEmbed(message)
				.setTitle(':green_book: Guide')
				.setDescription('To see how to use the tag system, view the guide [here](https://github.com/PenPow/SignalBot/wiki/Tag-System)');

			message.reply({ embeds: [embed] });
			break;
		}
		case 'list': {
			const tags = this.client.db.get(`guild_tags_${message.guild.id}`) || [];
			const embed = new SignalEmbed(message).setTitle(`${store} Tags in ${message.guild.name}`);
			let description;
			for(let i = 0; i < tags.length; i++) {
				description = tags.map((tag) => {
					return '`' + tag.name + '`';
				}).join(', ');
			}

			embed.setDescription(description || 'No Tags Found');
			message.reply({ embeds: [embed] });
			break;
		}
		case 'edit': {
			const embed = new SignalEmbed(message)
				.setTitle(`${store} Editing a Tag (1/3)`)
				.setDescription('Alright! Which tag do you want to edit?');

			await message.reply({ embeds: [embed] });

			const filter = (response) => response.author.id === message.author.id;
			message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] })
				.then(async (collected) => {
					const tags = this.client.db.get(`guild_tags_${message.guild.id}`) || [];


					let found = false;
					let tag;
					for(let i = 0; i < tags.length; i++) {
						if(tags[i].name === collected.first().content.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()) {
							found = true;
							tag = tags[i];
							break;
						}
					}

					if(!found) {
						embed.setTitle(`${store} No Tag Found`)
							.setDescription('No tag with that name was found');

						return message.reply({ embeds: [embed] });
					}

					if(!message.member.permissions.has('ADMINISTRATOR') || message.author.id !== tag.user.id) return this.sendErrorMessage(message, 2, 'You do not have permission to edit this tag.');

					embed.setTitle(`${store} Editing a Tag (2/3)`)
						.setDescription('What do you want the tag\'s content to be updated to?');

					await message.reply({ embeds: [embed] });
					message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] })
						.then(async (collected2) => {
							for(let i = 0; i < tags.length; i++) {
								if(tags[i].name === collected.first().content.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()) {
									tags[i].content = collected2.first().content.length > 2000 ? collected2.first().content : collected2.first().content.slice(0, 1997) + '...';
									tags[i].modifiedAt = `<t:${ (new Date().getTime() / 1000).toFixed(0)}:F>`;
									tags[i].modified.user = { tag: message.author.tag, id: message.author.id };
								}
							}

							this.client.db.set(`guild_tags_${message.guild.id}`, tags);
							embed.setTitle(`${store} Editing a Tag (3/3)`)
								.setDescription(`Tag Successfully Edited, access it through \`${this.client.db.get(`${message.guild.id}_prefix`)}${collected.first().content.replace(/(\r\n|\n|\r)/gm, '').replace(/ /g, '-').toLowerCase()}\``);

							await message.reply({ embeds: [embed] });
						})
						.catch(async () => {
							embed.setTitle(`${store} Expired`)
								.setDescription('Prompt Expired');

							await message.reply({ embeds: [embed] });

						});
				})
				.catch(async () => {
					embed.setTitle(`${store} Expired`)
						.setDescription('Prompt Expired');

					await message.reply({ embeds: [embed] });
				});

			break;
		}
		case 'delete': {
			if(args[1]) {
				await this.client.db.ensure(`guild_tags_${message.guild.id}`, []);
				const tags = this.client.db.get(`guild_tags_${message.guild.id}`);
				const embed = new SignalEmbed(message);

				if(!tags) {
					embed
						.setTitle(`${store} No Tags Found`)
						.setDescription('There are no tags in this server');
					return message.reply({ embeds: [embed] });
				}

				for(let i = 0; i < tags.length; i++) {
					if(tags[i].name.toLowerCase() === args[1].replace(/(\r\n|\n|\r)/gm, '').replace(/ /g, '-').toLowerCase()) {
						if(!message.member.permissions.has('ADMINISTRATOR') || message.author.id !== tags[i].user.id) return this.sendErrorMessage(message, 2, 'You do not have permission to delete this tag.');
						tags.splice(i, 1);
						this.client.db.set(`guild_tags_${message.guild.id}`, tags);

						embed.setTitle(`${store} Tag Removed`)
							.setDescription('Successfully removed the tag!');

						return message.reply({ embeds: [embed] });
					}
				}

				embed
					.setTitle(`${store} No Tag Found`)
					.setDescription(`There are no tags in this server named \`${args[1]}\``);
				return message.reply({ embeds: [embed] });
			}
			else {
				const embed = new SignalEmbed(message)
					.setTitle(`${store} Which Tag?`)
					.setDescription('Alright! What tag do you want me to delete?');

				await message.reply({ embeds: [embed] });

				const filter = (response) => response.author.id === message.author.id;
				message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] })
					.then(async (collected) => {
						await this.client.db.ensure(`guild_tags_${message.guild.id}`, []);
						const tags = this.client.db.get(`guild_tags_${message.guild.id}`);

						if(!tags) {
							embed.setTitle(`${store} No Tags Found`)
								.setDescription('There are no tags in this server');
							return message.reply({ embeds: [embed] });
						}

						for(let i = 0; i < tags.length; i++) {
							if(tags[i].name.toLowerCase() === collected.first().content.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()) {
								if(!message.member.permissions.has('ADMINISTRATOR') || message.author.id !== tags[i].user.id) return this.sendErrorMessage(message, 2, 'You do not have permission to delete this tag.');
								tags.splice(i, 1);
								this.client.db.set(`guild_tags_${message.guild.id}`, tags);

								embed.setTitle(`${store} Tag Removed`)
									.setDescription('Successfully removed the tag!');

								return message.reply({ embeds: [embed] });
							}
						}

						embed.setTitle(`${store} No Tag Found`)
							.setDescription(`There are no tags in this server named \`${collected.first().content.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()}\``);
						return message.reply({ embeds: [embed] });
					});
			}
			break;
		}
		case 'show': {
			if(args[1]) {
				await this.client.db.ensure(`guild_tags_${message.guild.id}`, []);
				const tags = this.client.db.get(`guild_tags_${message.guild.id}`);

				if(!tags) {
					const embed = new SignalEmbed(message)
						.setTitle(`${store} No Tags Found`)
						.setDescription('There are no tags in this server');
					return message.reply({ embeds: [embed] });
				}

				for(let i = 0; i < tags.length; i++) {
					if(tags[i].name.toLowerCase() === args[1].replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()) {
						const embed = new SignalEmbed(message)
							.setDescription(`❯ **Name**
								\`${tags[i].name}\`
								❯ **User**
								\`${tags[i].user.tag}\` (${tags[i].user.id})
								❯ **Uses**
								\`${tags[i].uses}\`
								❯ **Created**
								${tags[i].createdAt}
								❯ **Modified**
								${tags[i].modifiedAt}
								❯ **Last Modified By**
								\`${tags[i].modified.user.tag}\` (${tags[i].modified.user.id})
								`);

						return message.reply({ embeds: [embed] });
					}
				}

				const embed = new SignalEmbed(message)
					.setTitle(`${store} No Tag Found`)
					.setDescription(`There are no tags in this server named \`${args[1]}\``);
				return message.reply({ embeds: [embed] });
			}
			else {
				const embed = new SignalEmbed(message)
					.setTitle(`${store} What Tag to Search For`)
					.setDescription('Alright! What tag do you want to search for');

				await message.reply({ embeds: [embed] });

				const filter = (response) => response.author.id === message.author.id;
				message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] })
					.then(async (collected) => {
						await this.client.db.ensure(`guild_tags_${message.guild.id}`, []);
						const tags = this.client.db.get(`guild_tags_${message.guild.id}`) || [];

						if(!tags) {
							embed.setTitle(`${store} No Tags Found`)
								.setDescription('There are no tags in this server');
							return message.reply({ embeds: [embed] });
						}

						for(let i = 0; i < tags.length; i++) {
							if(tags[i].name.toLowerCase() === collected.first().content.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()) {
								embed
									.setDescription(`❯ **Name**
								\`${tags[i].name}\`
								❯ **User**
								\`${tags[i].user.tag}\` (${tags[i].user.id})
								❯ **Uses**
								\`${tags[i].uses}\`
								❯ **Created**
								${tags[i].createdAt}
								❯ **Modified**
								${tags[i].modifiedAt}
								❯ **Last Modified By**
								\`${tags[i].modified.user.tag}\` (${tags[i].modified.user.id})
								`);

								return message.reply({ embeds: [embed] });
							}
						}

						embed.setTitle(`${store} No Tag Found`)
							.setDescription(`There are no tags in this server named \`${collected.first().content.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()}\``);
						return message.reply({ embeds: [embed] });
					});
			}
			break;
		}
		case 'create': {
			if(!message.member.permissions.has('ADMINISTRATOR')) return this.sendErrorMessage(message, 2, 'You do not have permission to create a tag.');
			const embed = new SignalEmbed(message)
				.setTitle(`${store} Creating a New Tag (1/3)`)
				.setDescription('Alright! Lets create a new tag together, I am going to be walking you through the process of making a new tag, firstly, please enter the name of the tag used to access it! This prompt will expire in two minutes. Due to discord restrictions, your tag cannot have spaces in the name, Signal will replace all spaces with hyphens.');

			await message.reply({ embeds: [embed] });

			const filter = (response) => response.author.id === message.author.id;
			message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] })
				.then(async (collected) => {
					embed.setTitle(`${store} Creating a New Tag (2/3)`)
						.setDescription(`Great, your tag will be accessible through \`${this.client.db.get(`${message.guild.id}_prefix`)}${collected.first().content.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()}\`\n\nNow, we need to specify the content for the tag, write out the content of the tag. This prompt will expire in two minutes.`);

					await message.reply({ embeds: [embed] });
					message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] })
						.then(async (collected2) => {
							await this.client.db.ensure(`guild_tags_${message.guild.id}`, []);

							if(!this.client.db.includes('guild_tags', message.guild.id)) this.client.db.push('guild_tags', message.guild.id);
							const tags = this.client.db.get(`guild_tags_${message.guild.id}`) || [];

							for(let i = 0; i < tags.length; i++) {
								if(tags[i].name.toLowerCase() === collected.first().content.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()) {
									embed.setTitle(`${store} Tag Already Exists`)
										.setDescription('A tag with this name already exists, consider modifying it');

									await message.reply({ embeds: [embed] });

									return;
								}
							}
							this.client.db.push(`guild_tags_${message.guild.id}`, { uses: 0, name: collected.first().content.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase(), content: collected2.first().content.length > 2000 ? collected2.first().content : collected2.first().content.slice(0, 1997) + '...', user: { tag: message.author.tag, id: message.author.id }, createdAt: `<t:${ (new Date().getTime() / 1000).toFixed(0)}:F>`, modifiedAt: `<t:${ (new Date().getTime() / 1000).toFixed(0)}:F>`, modified: { user: { tag: message.author.tag, id: message.author.id } } });
							embed.setTitle(`${store} Creating a New Tag (3/3)`)
								.setDescription(`Tag Successfully Created, access it through \`${this.client.db.get(`${message.guild.id}_prefix`)}${collected.first().content.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()}\``);

							await message.reply({ embeds: [embed] });
						})
						.catch(async () => {
							embed.setTitle(`${store} Expired`)
								.setDescription('Prompt Expired');

							await message.reply({ embeds: [embed] });

						});
				})
				.catch(async () => {
					embed.setTitle(`${store} Expired`)
						.setDescription('Prompt Expired');

					await message.reply({ embeds: [embed] });
				});

			break;
		}
		}
	}

	async slashRun(interaction, args) {
		await this.client.db.ensure(`guild_tags_${interaction.guild.id}`, []);
		await this.client.db.ensure('guild_tags', []);
		switch(args.first().name) {
		case 'guide': {
			const embed = new SignalEmbed(interaction)
				.setTitle(':green_book: Guide')
				.setDescription('To see how to use the tag system, view the guide [here](https://github.com/PenPow/SignalBot/wiki/Tag-System)');

			interaction.reply({ embeds: [embed], ephemeral: true });
			break;
		}
		case 'list': {
			const tags = this.client.db.get(`guild_tags_${interaction.guild.id}`) || [];
			const embed = new SignalEmbed(interaction).setTitle(`${store} Tags in ${interaction.guild.name}`);
			let description;
			for(let i = 0; i < tags.length; i++) {
				description = tags.map((tag) => {
					return '`' + tag.name + '`';
				}).join(', ');
			}

			embed.setDescription(description || 'No Tags Found');
			interaction.reply({ embeds: [embed], ephemeral: true });
			break;
		}
		case 'edit': {
			const embed = new SignalEmbed(interaction);
			const tags = this.client.db.get(`guild_tags_${interaction.guild.id}`) || [];

			let found = false;
			let tag;
			for(let i = 0; i < tags.length; i++) {
				if(tags[i].name === args.get('edit').options.get('name')?.value.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()) {
					found = true;
					tag = tags[i];
					break;
				}
			}

			if(!interaction.member.permissions.has('ADMINISTRATOR') || interaction.user.id !== tag.user.id) return this.sendErrorMessage(interaction, 2, 'You do not have permission to edit this tag.');

			if(!found) {
				embed.setTitle(`${store} No Tag Found`)
					.setDescription('No tag with that name was found');

				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			for(let i = 0; i < tags.length; i++) {
				if(tags[i].name === args.get('edit').options.get('name')?.value.replace(/ /g, '-').replace(/(\r\n|\n|\r)/gm, '').toLowerCase()) {
					tags[i].content = args.get('edit').options.get('content')?.value.length > 2000 ? args.get('edit').options.get('content')?.value : args.get('edit').options.get('content')?.value.slice(0, 1997) + '...';
					tags[i].modifiedAt = `<t:${ (new Date().getTime() / 1000).toFixed(0)}:F>`;
					tags[i].modified.user = { tag: interaction.user.tag, id: interaction.user.id };
				}
			}

			this.client.db.set(`guild_tags_${interaction.guild.id}`, tags);
			embed.setTitle(`${store} Edited Tag`)
				.setDescription(`Tag Successfully Edited, access it through \`${this.client.db.get(`${interaction.guild.id}_prefix`)}${args.get('edit').options.get('name')?.value.replace(/(\r\n|\n|\r)/gm, '').replace(/ /g, '-').toLowerCase()}\``);

			await interaction.reply({ embeds: [embed], ephemeral: true });

			break;
		}
		case 'delete': {
			await this.client.db.ensure(`guild_tags_${interaction.guild.id}`, []);
			const tags = this.client.db.get(`guild_tags_${interaction.guild.id}`);
			const embed = new SignalEmbed(interaction);

			if(!tags) {
				embed
					.setTitle(`${store} No Tags Found`)
					.setDescription('There are no tags in this server');
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			for(let i = 0; i < tags.length; i++) {
				if(tags[i].name.toLowerCase() === args.get('delete').options.get('name')?.value.replace(/(\r\n|\n|\r)/gm, '').replace(/ /g, '-').toLowerCase()) {
					if(!interaction.member.permissions.has('ADMINISTRATOR') || interaction.user.id !== tags[i].user.id) return this.sendErrorMessage(interaction, 2, 'You do not have permission to delete this tag.');
					tags.splice(i, 1);
					this.client.db.set(`guild_tags_${interaction.guild.id}`, tags);

					embed.setTitle(`${store} Tag Removed`)
						.setDescription('Successfully removed the tag!');

					return interaction.reply({ embeds: [embed], ephemeral: true });
				}
			}

			embed
				.setTitle(`${store} No Tag Found`)
				.setDescription(`There are no tags in this server named \`${args.get('delete').options.get('name')?.value.replace(/(\r\n|\n|\r)/gm, '').replace(/ /g, '-').toLowerCase()}\``);
			interaction.reply({ embeds: [embed], ephemeral: true });
			break;
		}
		case 'show': {
			await this.client.db.ensure(`guild_tags_${interaction.guild.id}`, []);
			const tags = this.client.db.get(`guild_tags_${interaction.guild.id}`);

			if(!tags) {
				const embed = new SignalEmbed(interaction)
					.setTitle(`${store} No Tags Found`)
					.setDescription('There are no tags in this server');
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			for(let i = 0; i < tags.length; i++) {
				if(tags[i].name.toLowerCase() === args.get('show').options.get('name')?.value.replace(/(\r\n|\n|\r)/gm, '').replace(/ /g, '-').toLowerCase()) {
					const embed = new SignalEmbed(interaction)
						.setDescription(`❯ **Name**
								\`${tags[i].name}\`
								❯ **User**
								\`${tags[i].user.tag}\` (${tags[i].user.id})
								❯ **Uses**
								\`${tags[i].uses}\`
								❯ **Created**
								${tags[i].createdAt}
								❯ **Modified**
								${tags[i].modifiedAt}
								❯ **Last Modified By**
								\`${tags[i].modified.user.tag}\` (${tags[i].modified.user.id})
								`);

					return interaction.reply({ embeds: [embed], ephemeral: true });
				}
			}

			const embed = new SignalEmbed(interaction)
				.setTitle(`${store} No Tag Found`)
				.setDescription(`There are no tags in this server named \`${args.get('show').options.get('name')?.value.replace(/(\r\n|\n|\r)/gm, '').replace(/ /g, '-').toLowerCase()}\``);
			interaction.reply({ embeds: [embed], ephemeral: true });
			break;
		}
		case 'create': {
			if(!interaction.member.permissions.has('ADMINISTRATOR')) return this.sendSlasErrorMessage(interaction, 2, 'You do not have permission to create a tag.');
			await this.client.db.ensure(`guild_tags_${interaction.guild.id}`, []);

			if(!this.client.db.includes('guild_tags', interaction.guild.id)) this.client.db.push('guild_tags', interaction.guild.id);
			const tags = this.client.db.get(`guild_tags_${interaction.guild.id}`) || [];

			for(let i = 0; i < tags.length; i++) {
				if(tags[i].name.toLowerCase() === args.get('create').options.get('name')?.value.replace(/(\r\n|\n|\r)/gm, '').replace(/ /g, '-').toLowerCase()) {
					embed.setTitle(`${store} Tag Already Exists`)
						.setDescription('A tag with this name already exists, consider modifying it');

					await interaction.reply({ embeds: [embed], ephemeral: true });

					return;
				}
			}
			this.client.db.push(`guild_tags_${interaction.guild.id}`, { uses: 0, name: args.get('create').options.get('name')?.value.replace(/(\r\n|\n|\r)/gm, '').replace(/ /g, '-').toLowerCase(), content: args.get('create').options.get('content')?.value.length > 2000 ? args.get('create').options.get('content')?.value : args.get('create').options.get('content')?.value.slice(0, 1997) + '...', user: { tag: interaction.user.tag, id: interaction.user.id }, createdAt: `<t:${ (new Date().getTime() / 1000).toFixed(0)}:F>`, modifiedAt: `<t:${ (new Date().getTime() / 1000).toFixed(0)}:F>`, modified: { user: { tag: interaction.user.tag, id: interaction.user.id } } });
			const embed = new SignalEmbed(interaction).setTitle(`${store} Creating a New Tag (3/3)`)
				.setDescription(`Tag Successfully Created, access it through \`${this.client.db.get(`${interaction.guild.id}_prefix`)}${args.get('create').options.get('name')?.value.replace(/(\r\n|\n|\r)/gm, '').replace(/ /g, '-').toLowerCase()}\``);

			await interaction.reply({ embeds: [embed], ephemeral: true });

			break;
		}
		}
	}

	generateSlashCommand() {
		return {
			name: this.name,
			description: this.description,
			options: [{
				name: 'create',
				type: 'SUB_COMMAND',
				description: 'Creates a new tag',
				options: [{
					name: 'name',
					type: 'STRING',
					description: 'The name of the tag',
					required: true,
				},
				{
					name: 'content',
					type: 'STRING',
					description: 'The content of the tag',
					required: true,
				}],
			},
			{
				name: 'list',
				type: 'SUB_COMMAND',
				description: 'Lists the tags for the server',
			},
			{
				name: 'show',
				type: 'SUB_COMMAND',
				description: 'Shows an existing tag',
				options: [{
					name: 'name',
					type: 'STRING',
					description: 'The name of the tag',
					required: true,
				}],
			},
			{
				name: 'edit',
				type: 'SUB_COMMAND',
				description: 'Edits a tag',
				options: [{
					name: 'name',
					type: 'STRING',
					description: 'The name of the tag',
					required: true,
				},
				{
					name: 'content',
					type: 'STRING',
					description: 'The content of the tag',
					required: true,
				}],
			},
			{
				name: 'delete',
				type: 'SUB_COMMAND',
				description: 'Deletes a tag',
				options: [{
					name: 'name',
					type: 'STRING',
					description: 'The name of the tag',
					required: true,
				}],
			},
			{
				name: 'guide',
				type: 'SUB_COMMAND',
				description: 'Shows the guide regarding tags',
			}],
		};
	}
};