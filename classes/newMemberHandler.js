import { GuildMember } from "discord.js";
import Config from "./config.js";

class NewMemberHandler {
    constructor() {
        this.accountAgeLimit = 1000 * 60 * 60 * 24 * 3; // 3 days.
    }

    /**
     * Called when a user joins a guild.
     * @param {GuildMember} member 
     */
    async handleNewMember(member) {
        const channel = await member.client.channels.fetch(Config.LOG_CHANNEL);
        if (channel.guild.id !== member.guild.id)
            return;

        const createdAt = Math.floor(member.user.createdTimestamp / 1000);
        let emoji = ":inbox_tray:";
        const warnings = [];
        const notes = [];

        if (member.user.createdTimestamp >= Date.now() - this.accountAgeLimit) {
            // The user might be an alternative account.
            emoji = ":telescope:";
            warnings.push("Potential alternative account as this is a new account.");
        }

        const isBlacklisted = await member.client.storage.isBlacklisted(member.user.id);
        if (isBlacklisted) {
            notes.push("This user is currently in the bot's internal blacklist, preventing them from using interactions.");
        }

        const appealCount = await member.client.storage.countAppealsFromUser(member.user.id);
        if (appealCount > 0) {
            notes.push(`This user has opened ${appealCount} appeal(s) through the appeals system.`);
        }

        let content = `${emoji} **${member.user.username}** (ID: ${member.user.id}) joined the server.\n` +
            `Created: <t:${createdAt}> (<t:${createdAt}:R>)`;
        
        const warningTemplate = `\n:triangular_flag_on_post: Warning: `;
        const noteTemplate = `\n:pencil: Note: `;

        if (warnings.length)
            content += warningTemplate + warnings.join(warningTemplate);
        if (notes.length)
            content += noteTemplate + notes.join(noteTemplate);
        
        channel.send({ content: content });
    }
}

export default NewMemberHandler;