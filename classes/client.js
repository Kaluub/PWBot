import { Client as DiscordClient, GatewayIntentBits } from "discord.js";
import { readdirSync } from "fs";
import { readJSON } from "../json.js";

export default class Client extends DiscordClient {
    constructor(commands) {
        super({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages]});
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