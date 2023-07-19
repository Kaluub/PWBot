import { GuildMember } from "discord.js";
import Config from "./config.js";

class RemovedMemberHandler {
    /**
     * Called when a user is removed from a guild.
     * @param {GuildMember} member 
     */
    async handleRemovedMember(member) {
        if (!Config.HOME_SERVERS.includes(member.guild.id))
            return;

        const channel = await member.client.channels.fetch(Config.LOG_CHANNEL);
        const joinedAt = Math.floor(member.joinedTimestamp / 1000);

        let content = `:outbox_tray: **${member.user.username}** (ID: ${member.user.id}) left or was removed from the server.\n` +
            `Joined: <t:${joinedAt}> (<t:${joinedAt}:R>)\n` +
            `Roles: \`${member.roles.cache.sort((roleA, roleB) => roleB.rawPosition - roleA.rawPosition).map(role => role.name).join(", ")}\``;
        
        channel.send({ content: content });
    }
}

export default RemovedMemberHandler;