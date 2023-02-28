const { Client, Collection, GatewayIntentBits, Partials, Events } = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const { token, dir } = require('./config.json');

async function download(url, folder, type) {
    const response = await fetch(url);
    const filename = makeid(10) + type;
    const dest = path.join(folder, filename);
    const fileStream = fs.createWriteStream(dest);
    response.body.pipe(fileStream);
    return new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
    });
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

async function checkDup() {
    const folderPath = dir.img;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const imageHashes = {};
    const files = await readdir(folderPath);
    for (const file of files) {
        const extension = path.extname(file).toLowerCase();
        if (imageExtensions.includes(extension)) {
            const filePath = path.join(folderPath, file);
            const buffer = fs.readFileSync(filePath);
            const hash = crypto.createHash('sha256').update(buffer).digest('hex');
            if (imageHashes[hash] === undefined) {
                imageHashes[hash] = filePath;
            } else {
                await unlink(filePath);
            }
        }
    }
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

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once('ready', () => {
    client.user.setActivity('&dm | &help');
    console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on(Events.MessageCreate, async(message) => {
    if (message.author.bot) return;

    if (!message.guildId) {
		if (message.attachments.size > 0) {
			for (const attachment of message.attachments.values()) {
				if (attachment && attachment.contentType.includes('image/')) {
					await download(attachment.url, dir.img, '.png');
				} else if (attachment && attachment.contentType.includes('video/')) {
					await download(attachment.url, dir.img, '.mp4');
				}
			}
			message.channel.send('Obrigado por teres dado isso a mim.\nAdicionei as imagens na pasta. Só falta serem validadas');
			await checkDup();
			console.log('>> Ficheiros duplicados apagados');
		} else {
			message.channel.send('Quero uma imagem, não quero falar contigo');
		}  
    }
});

client.login(token);