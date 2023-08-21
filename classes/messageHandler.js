import { Message } from "discord.js";

class MessageHandler {
    constructor() {
    }

    /**
     * Called when a user joins a guild.
     * @param {Message} message 
     */
    async handleMessage(message) {
        const searchString = message.content.replace(/😺/g, "");
        if (message.deletable && searchString.match(/[A-Za-z0-9 _.,?!"'$()#+\-\/\[\]]/g)?.length != searchString.length)
            message.delete();
    }
}

export default MessageHandler;