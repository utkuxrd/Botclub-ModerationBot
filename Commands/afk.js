const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args) => {

    if (message.member.displayName.startsWith("[AFK]")) return;
    let uye = message.guild.members.cache.get(message.author.id);
    let reason = args.join(' ') || "Belirtilmedi!";
    let nick = uye.displayName;
    db.set(`sebep_${message.author.id}_${message.guild.id}`, reason);
    db.set(`user_${message.author.id}_${message.guild.id}`,message.author.id);
    db.set(`afktime_${message.guild.id}`,Date.now());
    db.set(`nick_${message.author.id}_${message.guild.id}`, nick);
    let sebep = db.fetch(`sebep_${message.author.id}_${message.guild.id}`);
    message.member.setNickname(`[AFK] ` + nick);
    message.reply(new Discord.MessageEmbed().setDescription(`${message.author} Başarıyla AFK moduna giriş yaptınız. \n\n \`˃\` Sebep: **${reason}**`).setColor('RANDOM'))
};

exports.conf = {
    commands: ["afk"],
    usage: "[p]afk",
    enabled: true,
    guildOnly: true
};