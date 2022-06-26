import Discord from "discord.js";
import { readJSON } from "../json.js";

export default class Client extends Discord.Client {
    constructor(commands) {
        super({intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.GUILD_MEMBERS]})
        this.commands = commands
        this.config = readJSON("config.json")
    }
}