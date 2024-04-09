const discord = require("discord.js")
const bedrockProtocol = require("bedrock-protocol")
const uuid = require("uuid")
const { config } = require("dotenv")

config()

const bot = bedrockProtocol.createClient({
    profilesFolder: "./profiles",
    realms: {
        pickRealm: (realm) => realm.find(r => r.name.replace(/§\w/g, "").toLowerCase().includes(process.env.realmName))
    }
})

const client = new discord.Client({
    intents: ["MessageContent"],
    allowedMentions: []
})


client.on("messageCreate", (message) => {

    if (message.channel.id !== process.env.channel_id && !message.author.bot) return;

    const formattedMessage = `§8[§9Discord§8] §7${message.author.username} § §8>§f${message.content.replace(/§\w/g, "")}`

    const randomUUID = uuid.v4()
    bot.queue(`command_request`, {
        command: `tellraw @a {"rawtext":[{"text":"${formattedMessage}}]}`,
        origin: {
            type: "player",
            request_id: randomUUID,
            uuid: randomUUID
        },
        interval: false,
        version: 70
    })

})


client.login(process.env.token)