const Discord = require('discord.js');
const client = new Discord.Client();
const DisTube = require('distube');
const distube = new DisTube(client, { searchSongs: false, emitNewSongOnly: true });
const { token } = require('./info.json');
const prefix = '$';

client.on("ready", () => {
    console.log(`Musico is online!`);
});

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift();

    // Queue status template
    const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

    // DisTube event listeners, more in the documentation page
    distube
        .on("playSong", (message, queue, song) => message.channel.send(
            `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
        ))
        .on("addSong", (message, queue, song) => message.channel.send(
            `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
        ))
        .on("playList", (message, queue, playlist, song) => message.channel.send(
            `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
        ))
        .on("addList", (message, queue, playlist) => message.channel.send(
            `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
        ))
        // DisTubeOptions.searchSongs = true
        .on("searchResult", (message, result) => {
            let i = 0;
            message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
        })
        // DisTubeOptions.searchSongs = true
        .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
        .on("error", (message, e) => {
            console.error(e)
            message.channel.send("An error encountered: " + e);
    });

    if (command == "play") {
        if (!message.member.voice.channel) return message.channel.send('You must be in a VC to play something!');
        if (!args[0]) return message.channel.send('You must state something to play.');
        distube.play(message, args.join(" "));
    }
    if (command == 'stop') {
        const bot = message.guild.members.cache.get(client.user.id);
        if (!message.member.voice.channel) return message.channel.send('Your not in a VC.');
        distube.stop(message);
        message.channel.send('You must be at the same VC as me!');
        distube.stop(message);
        message.channel.send('You stopped the music.');
    }
});

client.login(token);