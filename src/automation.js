const reactionTriggers = require("./jsons/reactionTriggers.json");
const falas = require("./falas.js");

module.exports = {
    run: async function (rng, message, client, text) {

        // REACT
        react(Math.random(), message, text);

        // MANOEL
        if (text.includes("manoel") && !text.includes("!")) respond(message, client, text);

        // INSULT
        if (rng > 0.025 && rng <= 0.04) insult(message);

        // BOM DIA
        if (text.includes("bom dia") && !text.includes("manoel") && rng > 0.6) client.sendMessage(message.from, "bom dia é a cabeça da minha pica desgraça");

    }
}

function react(rng, message, text) {
    if (reactionTriggers.maconha.some(e => text.includes(e))) message.react('🍁');
    else if (reactionTriggers.bolsonaro.some(e => text.includes(e))) message.react('🇧🇷');
    else if (reactionTriggers.lula.some(e => text.includes(e))) message.react('🇻🇳');
    else if (rng <= 0.025) message.react(falas.reacoes[Math.floor(Math.random() * falas.reacoes.length)]);
};

function insult(message) {
    message.reply(falas.insultos[Math.floor(Math.random() * falas.insultos.length)]);
};

function respond(message, client, text) {
    if (text.includes("?")) message.reply(falas.respostas[Math.floor(Math.random() * falas.respostas.length)]);
    else if (text == "manoel" || reactionTriggers.oi.some(t => text.includes(t))) client.sendMessage(message.from, falas.saudacoes[Math.floor(Math.random() * falas.saudacoes.length)]);
    else client.sendMessage(message.from, falas.mencoes[Math.floor(Math.random() * falas.mencoes.length)]);
}