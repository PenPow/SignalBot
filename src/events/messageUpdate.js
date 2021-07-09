class messageUpdate {
	constructor(client) {
		this.client = client;
	}

	async run(args) {
		const [oldMessage, newMessage] = args;
		if (newMessage.webhookID) return;

		if(newMessage.member && newMessage.id === newMessage.member.lastMessageID && !oldMessage.command) {
			this.client.emit('message', newMessage);
		}
	}
}

module.exports = messageUpdate;