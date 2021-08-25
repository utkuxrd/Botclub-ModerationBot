const beta = require('discord.js');

exports.run = async (client, message, args) => {

    message.channel.send(`
${message.author}, 
\`\`\`\Türkiyenin en iyi ve ücretsiz kod paylaşım sunucusu.
Kodlar site üzerinden paylaşılmaktadır.\`\`\`\

**Site:** https://botclub.net`)

};
exports.conf = {
    commands: ["site", "website"],
    usage: "[p]site",
    enabled: true,
    guildOnly: true
};