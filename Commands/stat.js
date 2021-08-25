const { MessageEmbed } = require('discord.js');
const db = require('quick.db');
const moment = require('moment');
require('moment-duration-format');
moment.locale('tr');

exports.run = async (client, message, args) => {

    let beta = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.author;
    let member = message.guild.member(beta)
    let dataMessage = await db.get(`messageData.${member.id}.channel`) || {};
    let dataVoice = await db.get(`voiceData.${member.id}.channel`) || {};
    let messageData = Object.keys(dataMessage).map(id => {
    return {
        channelID: id,
        totalMessage: dataMessage[id]
    }
}).sort((a, b) => b.totalMessage - a.totalMessage);

let voiceData = Object.keys(dataVoice).map(id => {
    return {
        channelID: id,
        totalTime: dataVoice[id]
    }
}).sort((a, b) => b.totalTime - a.totalTime);

let dataMessage0 = await db.get(`messageData.${member.id}.times`) || [{ time: 0, puan: 0 }, { time: 0, puan: 0 }];
let dataVoice0 = await db.get(`voiceData.${member.id}.times`) || [{ time: 0, puan: 0 }, { time: 0, puan: 0 }];
let messageData0 = Object.values(dataMessage0).map(id => {
    return {
        time: id.time,
        puan: id.puan
    };
})
let voiceData0 = Object.values(dataVoice0).map(id => {
    return {
        time: id.time,
        puan: id.puan
    };
})

let message14 = messageData0.filter(data => (Date.now() - (86400000 * 30)) < data.time).reduce((a, b) => a + b.puan, 0);
let message7 = messageData0.filter(data => (Date.now() - (86400000 * 7)) < data.time).reduce((a, b) => a + b.puan, 0);
let message24 = messageData0.filter(data => (Date.now() - 86400000) < data.time).reduce((a, b) => a + b.puan, 0);
let totalmessage = messageData0.filter(data => (Date.now())).reduce((a, b) => a + b.puan, 0);

let ses14 = voiceData0.filter(data => (Date.now() - (86400000 * 30)) < data.time).reduce((a, b) => a + b.puan, 0);
let ses7 = voiceData0.filter(data => (Date.now() - (86400000 * 7)) < data.time).reduce((a, b) => a + b.puan, 0);
let ses24 = voiceData0.filter(data => (Date.now() - 86400000) < data.time).reduce((a, b) => a + b.puan, 0);
let totalVoice = voiceData0.filter(data => (Date.now())).reduce((a, b) => a + b.puan, 0);

let cDurum = message.author.presence.status;
    let cdurum;
    if(cDurum === 'online') cdurum = "Çevrimiçi"
    if(cDurum === 'idle') cdurum = "Boşta"
    if(cDurum === 'dnd') cdurum = "Rahatsız Etmeyin"
    if(cDurum === 'Invisible') cdurum = "Görünmez/Çevrimdışı"

    const embed = new MessageEmbed()
    .setColor("#5765f1")
    .setAuthor(member.user.tag, member.user.displayAvatarURL({dynamic:true , size :2048}))
    .setFooter(message.guild.name, message.guild.iconURL())
    .setThumbnail(member.user.avatarURL({ dynamic: true }))
    .setDescription(`${member} - **(\`${member.id}\`)**
    
    __Kullanıcı Bilgisi__:
    **\`•\`Profil: <@${(member.id)}>**
    **\`•\`ID: \`${member.id}\`**
    **\`•\`Durum: \`${cdurum} \`**
    **\`•\`Sunucuya Katılma: \`${moment(member.joinedAt).format("DD/MM/YYYY")}\`**

    __Toplam İstatistikleri__:
    **\`•\`Ses: \`${moment.duration(totalVoice).format("HH [Saat], mm [Dakika]")}\`**
    **\`•\`Text: \`${totalmessage} mesaj\`**   

    __Aktif Olduğu Kanallar__:
    **\`•\`Text: ${messageData[0] ? `<#${messageData[0].channelID}>` : "Veri Yok"}: \`${messageData[0] ? messageData[0].totalMessage : 0} Mesaj\`**
    **\`•\`Ses: ${voiceData[0] ? `<#${voiceData[0].channelID}>` : 'Veri Yok!'}: \`${voiceData[0] ? moment.duration(voiceData[0].totalTime).format("HH [Saat], mm [Dakika]") : 'Veri Yok!'}\`**
     
     __**Son 14 Gün içindeki kullanıcı ses ve text istatistikleri.**__
     `).addFields({
        name: `**__Text__:**`,
        value: `**\`•\`24 Saat: \`${message24} mesaj\` \n \`•\`1 Hafta: \`${message7} mesaj\`\n \`•\`14 Gün: \`${message14} mesaj\`**`,
        inline: true
      }, {
        name: `**__Ses__:**`,
        value: `**\`•\`24 Saat: \`${moment.duration(ses24).format("HH [Saat], mm [Dakika]")}\`\n \`•\`1 Hafta: \`${moment.duration(ses7).format("HH [Saat], mm [Dakika]")}\`\n \`•\`14 Gün: \`${moment.duration(ses14).format("HH [Saat], mm [Dakika]")}\`**`,
        inline: true
});
message.channel.send(embed);

};

exports.conf = {
    commands: ["me", "i"],
    usage: "[p]me",
    enabled: true,
    guildOnly: true
};