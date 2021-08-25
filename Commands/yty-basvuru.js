const Discord = require('discord.js');
const betaconf = require('../Settings/Settings.json');

exports.run = async (client, message, args) => {

    const embed = new Discord.MessageEmbed().setColor("#5765f2").setFooter(`**${client.users.cache.get("852615172673503262").tag || "Beta"} yetkili başvuru sistemi.**`)
    
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if(message.channel.id === betaconf.CCID){
        var channel = message.guild.channels.cache.find((channel) => channel.name === `${message.member.displayName}-başvuru`);
        
        var LogChannel = message.guild.channels.cache.find((channel) => channel.id === betaconf.LogChannelID);
        if(channel){
            return message.channel.send(`Zaten başvuru kanalınız açık! <#${channel.id}>`).then(msg => msg.delete({timeout: 6000}));
                } else {
        let category = message.guild.channels.cache.get(betaconf.KategoryID);
            message.guild.channels.create(`${message.member.displayName}-başvuru`, {
                parent: category,
                permissionOverwrites: [
                    {id: client.user.id, allow: [('VIEW_CHANNEL'), ('SEND_MESSAGES'), ('ATTACH_FILES')]},
                    {id: betaconf.EveryoneID, deny: ['VIEW_CHANNEL']},
                    {id: message.author.id, allow: [('VIEW_CHANNEL'), ('SEND_MESSAGES')]}]
                }).then(channel => {
    
    
                    const filter = m => m.author === message.author;
                    var cevaplar = [];
                    message.react(betaconf.TikID)
                    message.delete({ timeout: 2000 });
                  
    
                    channel.send(`:wave: | <@!${message.author.id}>, Başvuru formuna hoşgeldin. Lütfen tüm bilgileri eksiksiz ve doğru şekilde doldur`)
    
                    channel.send("**İsminiz ve Yaşınız ?**");
                    channel.awaitMessages(filter, { max: 1 })
                      .then(function (collected) {
                          collected.each(msj => cevaplar.push(msj.content));
    
                    channel.send(`**Yetkili olduğunuzda neyle ilgilenirseniz ?** <Botlardan ve altyapılardan anlıyorum/İnsanlarla ilgilenmeyi seviyorum>`);
                    channel.awaitMessages(filter, { max: 1 })
                        .then(function (collected) {
                        collected.each(msj => cevaplar.push(msj.content));
    
                    channel.send(`**Günde kaç saat aktif olabilirsiniz ?** <1/24>`);
                    channel.awaitMessages(filter, { max: 1 })
                        .then(function (collected) {
                        collected.each(msj => cevaplar.push(msj.content));
    
                    channel.send(`**Kaç sunucuda yetkili oldunuz ?**`);
                    channel.awaitMessages(filter, { max: 1 })
                        .then(function (collected) {
                        collected.each(msj => cevaplar.push(msj.content));
    
                    channel.send(`**Discord platformunu kaç senedir kullanıyorsunuz ?**`);
                    channel.awaitMessages(filter, { max: 1 })
                            .then(function (collected) {
                            collected.each(msj => cevaplar.push(msj.content));
    
                    channel.send(`**Neden Botclub ?** (Açıklayıcı ve tek cümlede belirtiniz.)`);
                            channel.awaitMessages(filter, { max: 1 })
                            .then(function (collected) {
                            collected.each(msj => cevaplar.push(msj.content));
    
  
                    channel.send("**Başvurunuz başarıyla alındı, yetkili arkadaşlar sizinle ilgilenecekler, başvuru için teşekkür ederiz. Kanal 5 saniye içinde silinecek...**")
                    LogChannel.send(embed.setDescription(`${message.author} - (\`${message.author.id}\`) Adlı kullanıcının başvuru forumu.

                             **İsminiz ve Yaşınız ?**
                             \`•\` ${cevaplar[0]}
                             **Yetkili olduğunuzda neyle ilgilenirseniz ?**
                             \`•\` ${cevaplar[1]}
                             **Günde kaç saat aktif olabilirsiniz ?**
                             \`•\` ${cevaplar[2]}
                             **Kaç sunucuda yetkili oldunuz ?**
                             \`•\` ${cevaplar[3]}
                             **Discord platformunu kaç senedir kullanıyorsunuz ?**
                             \`•\` ${cevaplar[4]}
                             **Neden Botclub ?**
                             \`•\` ${cevaplar[5]}
                             
                            \`\`\`\ !onayla ${message.author.id} \n !reddet ${message.author.id} <sebep>\`\`\``));
                    setTimeout(function() {
                                    channel.delete();
                                     }, 5000);
                                })
                            })
                        })
                    })
                })
          })
                  }).catch(console.error)
                  
            }
        }

        
};

exports.conf = {
    commands: ["başvur", "başvuru"],
    usage: "[p]başvur",
    enabled: true,
    guildOnly: true
};
