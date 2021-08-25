const { MessageEmbed } = require('discord.js');
const db = require('quick.db');
const moment = require('moment');
require('moment-duration-format');
moment.locale('tr');

module.exports.run = async(client, message, args) => {

        let dataMessage = await db.get(`messageData`) || {};

        const topMessage = Object.keys(dataMessage).map(id => {
            return {
                userID: id,
                data: Object.values(dataMessage[id].channel || {}).reduce((a, b) => a + b, 0)
            }
        }).sort((a, b) => b.data - a.data).slice(0, 15).map((data, i) => `⦁ ${message.guild.members.cache.get(data.userID)}: \`${data.data} Mesaj\``)

        const embed = new MessageEmbed()
            .setFooter(message.guild.name, message.guild.iconURL())
            .setColor('#5963f3')
            .addField("**Mesaj | Top 15**", topMessage.length >= 1 ? topMessage : "Veri Yok!")
        return message.channel.send(embed)
    };

exports.conf = {
    commands: ["toptext", "topmesaj", "mesaj"],
    usage: "[p]toptext",
    enabled: true,
    guildOnly: true
};