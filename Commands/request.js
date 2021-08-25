const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
    let embed =  new MessageEmbed().setColor('RANDOM').setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));

    let beta = args.splice(0).join(" ");
    if (!beta) return message.channel.send(embed.setDescription(`${message.author}, Eksik arguman kullandınız, \`Lütfen istek kodunuzu belirtiniz.\``));

    client.channels.cache.get("868627061797961789").send(embed.setDescription(beta)).then(x => x.react("<:onayla:851465207741415484>") && x.react("<:reddet:851465207719919626>"))

};

exports.conf = {
    commands: ["iste-kod", "istek", "istekkod", "kod"],
    usage: "[p]istekkod",
    enabled: true,
    guildOnly: true
};