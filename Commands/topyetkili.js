const { MessageEmbed } = require('discord.js');
const settings = require("../Settings/Settings.json");
const db = require('quick.db');

exports.run = async (client, message, args) => {

    if (!message.member.roles.cache.has(settings.enAltYetkiliRol) && !message.member.hasPermission("ADMINISTRATOR")) return;

    let top = message.guild.members.cache.filter(uye => db.get(`abone.${uye.id}`)).array().sort((uye1, uye2) => Number(db.get(`abone.${uye2.id}`))-Number(db.get(`abone.${uye1.id}`))).slice(0, 15).map((uye, index) =>  (index+1) + " <@"+ uye +"> **\`" + db.get(`abone.${uye.id}`) +" Abone\`**").join('\n');
    message.channel.send(new MessageEmbed().setAuthor(`Abone | Top 15`).setFooter(message.guild.name, message.guild.iconURL()).setColor("#5963f2").setDescription(top));
};

exports.conf = {
    commands: ["yetkili-top", "yetkilitop", "yetkilit", "abonetop", "topabone"],
    usage: "[p]topabone",
    enabled: true,
    guildOnly: true
};