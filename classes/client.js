import { Client, IntentsBitField } from "discord.js";
import Config from "./config.js";
import InteractionHandler from "./interactionHandler.js";
import NewMemberHandler from "./newMemberHandler.js";
import Storage from "./postgres.js";
import RemovedMemberHandler from "./removedMemberHandler.js";
import MessageHandler from "./messageHandler.js";

class DiscordClient extends Client {
    constructor() {
        super({ intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent
        ] });
        this.storage = new Storage();
        this.interactionHandler = new InteractionHandler();
        this.newMemberHandler = new NewMemberHandler();
        this.removedMemberHandler = new RemovedMemberHandler();
        this.messageHandler = new MessageHandler();
        this.on("interactionCreate", this.interactionHandler.handleInteraction.bind(this.interactionHandler));
        this.on("guildMemberAdd", this.newMemberHandler.handleNewMember.bind(this.newMemberHandler));
        this.on("guildMemberRemove", this.removedMemberHandler.handleRemovedMember.bind(this.removedMemberHandler));
        // this.on("messageCreate", this.messageHandler.handleMessage.bind(this.messageHandler)); // Not needed right now.
    }

    async connectStorage() {
        await this.storage.startClient();
        console.log("Connected to database.");
    }

    async clientLogin() {
        await this.login(Config.TOKEN);
        console.log("Client logged in.");
    }

    async updateInteractions() {
        await this.interactionHandler.setApplicationCommands(this);
        console.log("Application commands set.");
    }
}

export default DiscordClient;