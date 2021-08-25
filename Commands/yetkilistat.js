const { MessageEmbed } = require('discord.js');
const settings = require("../Settings/Settings.json");
const db = require("quick.db");

exports.run = async (client, message, args) => {

    if (!message.member.roles.cache.has(settings.enAltYetkiliRol) && !message.member.hasPermission("ADMINISTRATOR")) return;

    let betaembed = new MessageEmbed().setColor('#5964f4').setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.author;
    let beta = db.fetch(`abone.${member.id}`);

    message.channel.send(betaembed.setDescription(`
        ${member} Adlı yetkili toplam **${beta || "0"}** abone rolü vermiş.
    `))
    
};

exports.conf = {
    commands: ["yetkilistat", "yetkili-stat", "yetkilii", "abonestat", "abone-stat"],
    usage: "[p]abonestat",
    enabled: true,
    guildOnly: true
};