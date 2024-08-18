import { Message } from "discord.js";
import config from "./config.js";

class MessageHandler {
    /**
     * Called when a new message is sent.
     * @param {Message} message 
     */
    async handleMessage(message) {
        // Temporary eval command.
        if (config.admins.includes(message.author.id) && message.content.startsWith(">>eval")) {
            let operation = message.content.substring(7);
            try {
                const client = message.client;
                const channel = message.channel;
                const result = eval(operation);
                message.react("✅");
                message.reply(`Result:\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
            } catch (e) {
                message.react("⛔");
                message.reply(`Error:\n\`\`\`${e}\n\`\`\``);
            }
        }
        return;
    }
}

export default MessageHandler;