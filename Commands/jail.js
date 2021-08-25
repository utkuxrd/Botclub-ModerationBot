const { MessageEmbed } = require("discord.js");
const settings = require("../Settings/Settings.json");
const db = require("quick.db");
const kdb = new db.table("kullanıcı");
const moment = require("moment");

exports.run = async (client, message, args) => {
    if (!message.member.roles.cache.has(settings.JailYT) && !message.member.hasPermission("ADMINISTRATOR")) return;
    let beta = new MessageEmbed().setColor('RANDOM').setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    let user = message.guild.member(member)
    if (!user) return message.channel.send(beta.setDescription(`${message.author}, Eksik arguman kullandınız, \`Lütfen bir kullanıcı belirtiniz.\``));
    let reason = args.splice(1).join(" ");
    if (!reason) return message.channel.send(beta.setDescription(`${message.author}, Eksik arguman kullandınız, \`Lütfen bir sebep belirtiniz.\``));

    if (user.id === message.author.id) return message.react(settings.no);
    if (user.id === client.user.id) return message.react(settings.no);
    if (user.roles.highest.position >= message.member.roles.highest.position) return message.react(settings.no);


    let atilanAy = moment(Date.now()).format("MM");
    let atilanSaat = moment(Date.now()).format("HH:mm:ss");
    let atilanGün = moment(Date.now()).format("DD");
    let jailAtılma = `${atilanGün} ${atilanAy.replace("01", "Ocak").replace("02", "Şubat").replace("03", "Mart").replace("04", "Nisan").replace("05", "Mayıs").replace("06", "Haziran").replace("07", "Temmuz").replace("08", "Ağustos").replace("09", "Eylül").replace("10", "Ekim").replace("11", "Kasım").replace("12", "Aralık")} ${atilanSaat}`;

    user.roles.add(settings.boosterRol);
    user.roles.add(settings.JailRol);
    user.roles.cache.forEach(beta => {
    user.roles.remove(beta.id)
    });
    
    message.channel.send(beta.setDescription(`${user} - (\`${user.id}\`) Adlı kullanıcı jaile atıldı.`));

    kdb.set(`durum.${user.id}.jail`, true);
    client.channels.cache.get(settings.jailLog).send(beta.setDescription(`
    ${user} __Adlı kullanıcı jaile atıldı.__
    
    \`•\` **Yetkili**: ${message.author} (\`${message.author.id}\`)
    \`•\` **Kullanıcı**: ${user} (\`${user.id}\`)
    \`•\` **Tarih**: \`${jailAtılma}\`
    
    \`•\` **Sebep**: \`${reason}\``));
};

exports.conf = {
    commands: ["jail", "cezalı"],
    usage: "[p]jail",
    enabled: true,
    guildOnly: true
};