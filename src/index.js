const discord = require("discord.js")
const bedrockProtocol = require("bedrock-protocol")
const uuid = require("uuid")
const { config } = require("dotenv")

config()

const bot = bedrockProtocol.createClient({
    profilesFolder: "./profiles",
    realms: {
        pickRealm: (realms) => realms.find(realm => process.env.realm_id ? process.env.realm_id == realm.id : realm.name.replace(/§\w/g, "").includes(process.env.realm_name)).id
    }
})


const client = new discord.Client({
    intents: ["MessageContent", "Guilds", "GuildMessages"],
    allowedMentions: []
})

client.on("ready", () => console.log("Discord ready"))
bot.on("spawn", () => console.log("Bot spawned!"))

client.on("messageCreate", (message) => {
    if (message.channel.id !== process.env.channel_id || message.author.bot) return;

    const formattedMessage = `§8[§9Discord§8] §8[§f${message.member.roles.highest.name}§8] §7${message.author.username} § §8> §f${message.content.replace(/§\w/g, "")}`

    const randomUUID = uuid.v4()

    bot.queue(`command_request`, {
        command: `/tellraw @a {"rawtext":[{"text":"${formattedMessage}"}]}`,
        origin: {
            type: "player",
            request_id: randomUUID,
            uuid: randomUUID
        },
        interval: false,
        version: 70
    })
})

bot.on("text", async (packet) => {
    const channel = await client.channels.fetch(process.env.channel_id)
    
    if (packet.type == "chat") {

        try {
            var message = `${packet.source_name}: ${packet.message.replace(/§\w/g, "")}`
            channel.send({ content: `${message}`, allowedMentions: { parse: [] } })
        } catch (e) {
            console.log({ error: e.message, data: packet })
        }

    } else if (packet.type == "json") {

        try {
            var message = JSON.parse(packet.message).rawtext[0].text.replace(/§[0-9a-z]/g, "")
            channel.send({ content: `${message}`, allowedMentions: { parse: [] } })
        } catch (e) {
            console.log({ error: e.message, data: packet })
        }

    }


})

client.login(process.env.token)