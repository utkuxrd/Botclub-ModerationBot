const { MessageEmbed } = require('discord.js');
const settings = require("../Settings/Settings.json");
const db = require("quick.db");

exports.run = async (client, message, args) => {

    if (!message.member.roles.cache.has(settings.yoneticiROL) && !message.member.roles.cache.has(settings.leadRol) && !message.member.hasPermission("ADMINISTRATOR")) return;

    let beta = new MessageEmbed().setColor('RANDOM').setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }));

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    let user = message.guild.member(member)
    if(!user) return message.channel.send(beta.setDescription(`<@!${message.author.id}> bir kullanıcı belirtiniz.`));
    let isim = args[1];
    if (!isim) return message.channel.send(beta.setDescription(`<@!${message.author.id}> kullanıcının adını belirtiniz.`));

    user.setNickname(isim)
    client.channels.cache.get(settings.OnayRedLOG).send(`<@!${user.id}>`);
    client.channels.cache.get(settings.OnayRedLOG).send(beta.setDescription(`<:onayla:851465207741415484> | <@!${user.id}> **Yetkili başvurunuz başarıyla onaylandı ve rolleriniz verildi.**`))


    user.roles.add(settings.enAltYetkiliRol)
};

exports.conf = {
    commands: ["onayla", "onay"],
    usage: "[p]onayla",
    enabled: true,
    guildOnly: true
};