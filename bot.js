const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs')
const fetch = require('node-fetch')
const { token, dir } = require('./config.json');

function download(url, folder, type){
    fetch(url)
		.then(res =>
			res.body.pipe(fs.createWriteStream(folder + makeid(10) + type))
		)
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
    	GatewayIntentBits.MessageContent
	],
	partials: [
		Partials.Channel
	]
});

client.once('ready', () => {
	client.user.setActivity('&dm | &help');
	console.log('Ready!');
});

client.on("messageCreate", async(message) => {
	if (message.author.bot) return;

	if (!message.guildId) {
		if (message.attachments.first()){
			if (message.attachments.first().contentType.includes('image/')){
				download(message.attachments.first().url, dir.img, '.png');
			}
		} else {
			message.channel.send("Falta image corno");
		}
	}
});

client.login(token);