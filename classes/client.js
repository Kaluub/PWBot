import Discord from "discord.js";
import { readdirSync } from "fs";
import { readJSON } from "../json.js";

export default class Client extends Discord.Client {
    constructor(commands) {
        super({intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.GUILD_MEMBERS]});
        this.commands = commands;
        this.config = readJSON("config.json");
        this.json = this.loadJSONData();
    };

    loadJSONData() {
        let json = {};
        const eventFiles = readdirSync('./json').filter(file => file.endsWith('.json'));
        for(const file of eventFiles) {
            json[file.split(".")[0]] = readJSON(`./json/${file}`);
        };
        return json;
    };

    reloadConfig() {
        this.config = readJSON("config.json");
    };
};