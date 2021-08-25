const { MessageEmbed } = require("discord.js");
const axios = require('axios');

exports.run = async (client, message, args) => {

    var user = message.mentions.members.first() || client.users.cache.get(args[0]) || message.member;

    axios({
        method: 'GET',
        url: `https://discord.com/api/v8/users/${user.id}`,
        headers: {
            Authorization: `Bot ${client.token}`
        }
    })
        .then(function (response) {
            try {
                if (response.data.banner.includes(".null")) return message.channel.send(new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic:true })).setDescription(`${user} Adlı kullanıcının bannerına ulaşamadım.`))
                var embed = new MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL({ dynamic:true }))
                    .setImage(`https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}?size=512&quot`)
                    .setColor("FFFFFF")
                message.channel.send(embed)
            } catch (err) {
                message.channel.send(new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic:true })).setDescription(`${user} Adlı kullanıcının bannerına ulaşamadım.`))
            }
     })
}

exports.conf = {
    commands: ["banner"],
    usage: "[p]banner <member>",
    enabled: true,
    guildOnly: true
};