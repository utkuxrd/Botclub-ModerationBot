const { MessageEmbed } = require('discord.js');
const moment = require("moment");
require("moment-duration-format");


exports.run = async (client, message, args) => {

    let cuser = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.author;
    let cmember = message.guild.member(cuser)
    let cDurum = cmember.presence.status;
    let cdurum;
    if(cDurum === 'online') cdurum = "Çevrimiçi"
    if(cDurum === 'idle') cdurum = "Boşta"
    if(cDurum === 'dnd') cdurum = "Rahatsız Etmeyin"
    if(cDurum === 'Invisible') cdurum = "Görünmez/Çevrimdışı"

    let embed = new MessageEmbed()
    .setColor(cmember.displayHexColor)
    .setAuthor(cmember.user.tag, cmember.user.avatarURL({dynamic: true}))
    .setThumbnail(cmember.user.avatarURL({dynamic: true}))
    .addField("❯ Kullanıcı Bilgisi",` 
    
    **\`•\`Profil: <@${(cmember.id)}>**
    **\`•\`ID: \`${cmember.id}\`**
    **\`•\`Durum: \`${cdurum} \`**
    **\`•\`Oluşturulma: \`${moment(cmember.user.createdAt).format("DD/MM/YYYY")}\`**
    `)
    .addField("❯ Üyelik Bilgisi",` 
    
    **\`•\`Sunucu takma ad: \`${(cmember.nickname) || 'Yok'}\`**
    **\`•\`Sunucuya Katılma: \`${moment(cmember.joinedAt).format("DD/MM/YYYY")}\`**`)

    .addField("❯ Bazı Rolleri", `${cmember.roles.cache.size <= 15 ? cmember.roles.cache.filter(x => x.name !== "@everyone").map(x => x).join(`, `) : `Roller Çok Fazla...!`}`)
    message.channel.send(embed);
};
exports.conf = {
    commands: ["profil", "profile"],
    usage: "[p]profil",
    enabled: true,
    guildOnly: true
};