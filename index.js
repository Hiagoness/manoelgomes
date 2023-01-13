require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const commands = require('./src/commands.js');
const automation = require('./src/automation.js');

const client = new Client({
	authStrategy: new LocalAuth({ clientId: process.env.CLIENT_ID }),
	puppeteer: {
		executablePath: process.env.CHROME_PATH,
		args: ['--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-extensions',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--no-first-run',
			'--no-zygote',
			'--disable-gpu']
	}
});

client.on('qr', (qr) => {
	qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
	console.log('manoel gomes está entre nós');
});

client.on('group_join', (group) => {
	client.sendMessage(group.chatId, "membro novo tem q mamar os adm")
});

client.on('group_leave', (group) => {
	client.sendMessage(group.chatId, "já foi tarde puta desgraçada")
});

client.on('incoming_call', (call) => {
	client.sendMessage(call.from, "para de me ligar corno")
});

client.on('message', async message => {

	try {

		// AUTOMATION HANDLING		
		await automation.run(Math.random(), message, client, message?.body?.toLocaleLowerCase() || "");

		// COMMAND HANDLING
		if (message.body[0] == "!") {
			let comm = message.body.split(" ")[0].replace("!", "");
			console.log("!COMANDO:", `!${comm}`);
			if (typeof commands[comm] === "object")
				await commands[comm].run(comm, Math.random(), message, client, message.body.substring(comm.length + 2).toLocaleLowerCase() || "");
			else {
				console.error(`\n!!!COMANDO INEXISTENTE\n`);
				//await message.reply(`ctz q tu escreveu isso certo?\ntenta *!h* pra ver os comandos`);
			}
		}

	} catch (error) {
		console.error(error);
		await message.reply(`nu quais crashei aq`);
	}
});

client.initialize();