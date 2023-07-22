import { GuildMember } from "discord.js";
import Config from "./config.js";

class RemovedMemberHandler {
    /**
     * Called when a user is removed from a guild.
     * @param {GuildMember} member 
     */
    async handleRemovedMember(member) {
        const channel = await member.client.channels.fetch(Config.LOG_CHANNEL);
        if (channel.guild.id !== member.guild.id)
            return;
        
        const joinedAt = Math.floor(member.joinedTimestamp / 1000);
        const username = member.user.discriminator === "0" ? member.user.username : member.user.tag;

        let content = `:outbox_tray: **${username}** (ID: ${member.user.id}) left or was removed from the server.\n` +
            `Joined: <t:${joinedAt}> (<t:${joinedAt}:R>)\n` +
            `Roles: \`${member.roles.cache.sort((roleA, roleB) => roleB.rawPosition - roleA.rawPosition).map(role => role.name).join(", ")}\``;
        
        channel.send({ content: content });
    }
}

export default RemovedMemberHandler;