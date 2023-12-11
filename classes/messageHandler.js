import { Message } from "discord.js";

class MessageHandler {
    /**
     * Called when a new message is sent.
     * @param {Message} message 
     */
    async handleMessage(message) {
        if (message.author.bot) return;
        const messageSplit = message.content.toLowerCase();
        // TODO: message tags.
        if (Date.now() > 1702458000000) return;
        if ((messageSplit.includes("booster") || messageSplit.includes("xmas")) && (messageSplit.includes("not available") || messageSplit.includes("not working") || messageSplit.includes("broken") || messageSplit.includes("wrong") || messageSplit.includes("error"))) {
            message.reply({content: "⛔ The Xmas booster is not available yet! See an update posted here: https://discord.com/channels/399918427256520705/399964862131994644/1183742241131462697"})
        }
    }
}

export default MessageHandler;