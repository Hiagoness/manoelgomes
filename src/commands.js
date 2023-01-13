require('dotenv').config();
const { MessageMedia } = require('whatsapp-web.js');
const ytdl = require('ytdl-core');
const moment = require('moment');
const axios = require('axios');
const fs = require('fs');

const utils = require('./utils.js');
const falas = require('./falas.js');

module.exports = {
    h: {
        model: "!h",
        description: "lista de comandos",
        run: async function (command, rng, message, client, query) {
            let text = `\n┠==== BOT MANOEL GOMES =====\n┠========================\n┠\n`;
            const commands = Object.values(require('./commands.js')).filter(c => c.model?.length > 0);
            commands.forEach(c => text += `┠ *${c.model}*\n┠ _${c.description}_\n┠\n`);
            text += "┠========================\n\n";

            client.sendMessage(message.from, text);
        }
    },
    desgraca: {
        model: "!desgraca",
        description: "o desgraça feia quem gozou isso",
        run: async function (command, rng, message, client, query) {
            message.reply("https://www.npmjs.com/package/merge-images");
        }
    },
    lembretepv: {
        model: "!lembretepv _{o que fazer}_ _{EM ou DAQUI}_ _{x tempo}_",
        description: "te lembra de algo no privado",
        run: async function (command, rng, message, client, query) {
            try {
                const contact = await message.getContact();
                await reminder(message, query, (taskName) => {
                    client.sendMessage(contact.id._serialized, `ola amigo pelo que consta aqui no meu relogio ja ta na hora de ${taskName.toLowerCase()} se for possível obrigado`);
                });
            } catch (err) {
                console.error(err);
                message.reply(`${err.message.length > 60 ? `ctz q escreveu certo?\n*!lembrete _{o que fazer}_ _{EM ou DAQUI}_ _{x tempo}_*` : err.message}\nEx: _"!lembrete cortar a grama em 15 minutos"_`);
            }
        }
    },
    lembrete: {
        model: "!lembrete _{o que fazer}_ _{EM ou DAQUI}_ _{x tempo}_",
        description: "te lembra de algo no chat da conversa atual",
        run: async function (command, rng, message, client, query) {
            try {
                const contact = await message.getContact();
                await reminder(message, query, (taskName) => {
                    client.sendMessage(message.from, `*@${contact.id.user} TA NA HORA DE ${taskName.toUpperCase()}, BORA DESGRAÇA*`, { mentions: [contact] });
                });
            } catch (err) {
                console.error(err);
                message.reply(`${err.message.length > 60 ? `ctz q escreveu certo?\n*!lembrete _{o que fazer}_ _{EM ou DAQUI}_ _{x tempo}_*` : err.message}\nEx: _"!lembrete cortar a grama em 15 minutos"_`);
            }
        }
    },
    img: {
        model: "!img _{pesquisa}_",
        description: "retorna imagem do google",
        run: async function (command, rng, message, client, query) {
            try {
                let result = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${process.env.GG_API_KEY}&cx=${process.env.CSE_ID}&q=${encodeURI(query)}&safe=off&lr=lang_pt&searchType=image&fileType=jpg&imgSize=large&alt=json`);
                if (result?.data?.items?.length > 0) {
                    let image = await MessageMedia.fromUrl(result.data.items[Math.floor(Math.random() * result.data.items.length)].link);
                    if (image.filesize > 0) {
                        message.reply(image);
                    }
                    else
                        message.reply("dei conta de acha nn");
                }
                else message.reply("n achei nd");
            } catch (err) {
                console.error(err);
                if (err?.response?.status == 429)
                    message.reply("excedi minha cota do dia, só dá pra pesquisar trem q ja pesquisei hj")
            }
        }
    },
    play: {
        model: "!play _{link ou pesquisa}_",
        description: "reproduz vídeo do youtube",
        run: async function (command, rng, message, client, query) {
            query = query.replace("youtu.be/", "youtube.com/watch?v=");
            query = query.replace("m.youtube.com", "youtube.com");
            let guid = utils.newGuid();
            let filename = `./src/media/videos/${guid}.mp4`
            if (!(query.substring(8) == "https://")) {
                try {
                    query = await utils.getYoutubeUrl(query);
                } catch (error) {
                    message.reply('n achei esse video')
                    throw error;
                }
            }
            try {
                let title = "";
                let author = "";
                await new Promise((resolve, reject) => {
                    try {
                        ytdl(query, { quality: 18 },)
                            .on('info', (info) => {
                                title = info.videoDetails.title;
                                author = info.videoDetails.author.name;
                                message.reply('⏳ Enviando...')
                            })
                            .pipe(fs.createWriteStream(filename))
                            .on('close', () => resolve());
                    } catch (error) {
                        console.error(error);
                        reject();
                    }
                })
                    .then(async () => {
                        try {
                            let video = MessageMedia.fromFilePath(filename);
                            await client.sendMessage(message.from, `*${title}*\n_${author}_`, { media: video })
                            fs.unlink(filename, (err => {
                                if (err) console.error(err);
                            }));
                        } catch (error) {
                            console.error(error);
                            fs.unlink(filename, (err => {
                                if (err) console.error(err);
                            }));
                            client.sendMessage(message.from, "vídeo grande demais, da pra enviar nn")
                        }
                    })
            } catch (error) {
                console.error(error);
                fs.unlink(filename, (err => {
                    if (err) console.error(err);
                }));
                message.reply("manda um link q funciona égua");
            }
        },
    },
    clima: {
        model: "!clima _{nome da cidade}_",
        description: "previsão do tempo",
        run: async function (command, rng, message, client, query) {
            await axios.get(`https://api.hgbrasil.com/weather?key=45c875d1&city_name=${encodeURI(query.toLocaleLowerCase())}`)
                .then(async function (r) {
                    if (r.data.error)
                        throw r.data.error;
                    else {
                        let weather = r.data.results;
                        client.sendMessage(message.from, `tá fazendo ${weather.temp}°C em ${weather.city_name}, ${weather.description.toLocaleLowerCase()} com vento de ${weather.wind_speedy}`);
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    message.reply("achei essa cidade não doido");
                });
        }
    },
    manoel: {
        model: "!manoel",
        description: "toca algum áudio do manoel gomes",
        run: async function (command, rng, message, client, query) {
            await specificAudio(command, message.from, client, 7);
        }
    },
    elon: {
        model: "!elon",
        description: "elon musk uma vez disse",
        run: async function (command, rng, message, client, query) {
            await specificAudio(command, message.from, client);
        }
    },
    toguro: {
        model: "!toguro",
        description: "em pleno 2022",
        run: async function (command, rng, message, client, query) {
            await specificAudio(command, message.from, client);
        }
    },
    rocamboly: {
        model: "!rocamboly",
        description: "quem e esse rocamboly",
        run: async function (command, rng, message, client, query) {
            await specificAudio(command, message.from, client);
        }
    },
    masqueico: {
        model: "!masqueico",
        description: "MASQUEEEEICOOOOO",
        run: async function (command, rng, message, client, query) {
            await specificAudio(command, message.from, client);
        }
    },
    habla: {
        run: async function (command, rng, message, client, query) {
            await specificAudio(command, message.from, client, 6);
        }
    },
    daqui15: {
        run: async function (command, rng, message, client, query) {
            try {
                let quotedMsg = await message.getQuotedMessage();
                let currentTime = moment.unix(message.timestamp);
                if (message.hasQuotedMsg) {
                    replyTo = quotedMsg;
                    currentTime = moment.unix(quotedMsg.timestamp);
                    quotedMsg.reply(`15 minutos dessa mensagem serão ${moment(currentTime).add(15, 'minute').format('HH:mm') + "h"}`, quotedMsg.from);
                }
                else
                    message.reply(`15 minutos dessa mensagem serão ${moment(currentTime).add(15, 'minute').format('HH:mm') + "h"}`);

            } catch (error) {
                console.err(error);
                message.reply("deu pau aqui perai");
            }
        }
    }
}

async function specificAudio(audioName, to, client, n = 0) {
    let media = MessageMedia.fromFilePath(`./src/media/audios/${audioName}${n > 0 ? Math.floor(Math.random() * n) + 1 : ""}.mp3`);
    client.sendMessage(to, media, { sendMediaAsDocument: false, sendAudioAsVoice: true });
}

async function reminder(message, query, callback) {
    let taskName = "";
    let splitted = [];
    if (query.split(" em ")?.length > 1) {
        splitted = query.split(" em ");
        taskName = splitted[0]
    }
    else if (query.split(" daqui a ")?.length > 1) {
        splitted = query.split(" daqui a ");
        taskName = splitted[0]
    }
    else if (query.split(" daqui ")?.length > 1) {
        splitted = query.split(" daqui ");
        taskName = splitted[0]
    }
    else
        throw new Error(`tem que escrever usando "em" ou "daqui"`);

    let fullTime = splitted[1].split(" ");
    let number = fullTime[0];
    let unit = fullTime[1];

    if (parseInt(number) > 0)
        number = parseInt(number);
    else
        throw new Error(`bota um número q funciona caralho`);

    unit = utils.timeTranslate(unit);
    if (unit == fullTime[1])
        throw new Error(`n consegui entender a medida de tempo`);

    let horaDestino = moment().add(number, unit);
    if (!horaDestino.isAfter(moment()))
        throw new Error(`erro calculando a hora, tenta dnv`);

    let ms = horaDestino.valueOf() - moment().valueOf()
    if (ms > 604800000)
        throw new Error(`até lá já esqueci bixo, bota menos tempo`);

    message.reply("dexa co pai, vo te lembrar");

    setTimeout(async () => {
        callback(taskName)
    }, ms);

}