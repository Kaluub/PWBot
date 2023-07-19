import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { readFileSync } from "fs";

const appealStateColors = {
    "open": "#00FF00",
    "allow_replies": "#FFFF00",
    "closed": "#FF0000"
};

class Utils {
    static hasPermission(interaction, permission, user) {
        if (!interaction) return false;
        if (!interaction.guild) return true;
        if (interaction.channel.permissionsFor(user).has(permission)) return true;
        return false;
    }
    
    static formatSeconds(seconds) {
        const days = Math.floor(seconds / (60 * 60 * 24));
        const hours = Math.floor(seconds / (60 * 60)) - days * 24;
        const minutes = Math.floor(seconds / 60) - days * 24 * 60 - hours * 60;
        const remainingSeconds = seconds % 60;
        let result = "";
        if (days > 0) result += `${days}d `;
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `; 
        result += `${remainingSeconds}s`;
        return result;
    }

    static createAppealMessage(client, createdAt, authorId, content, appealState, replyRows) {
        const user = client.users.cache.get(authorId);

        const actionBarOne = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`appeal/reply`)
                    .setLabel("Reply")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("appeal/state/allow_replies")
                    .setLabel("Allow replies")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(appealState == "allow_replies"),
                new ButtonBuilder()
                    .setCustomId("appeal/state/closed")
                    .setLabel("Close")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(appealState == "closed"),
                new ButtonBuilder()
                    .setCustomId("appeal/state/open")
                    .setLabel("Mark as unhandled")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(appealState == "open")
            )
        
        const actionBarTwo = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("appeal/unban")
                    .setLabel("Unban")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("appeal/block")
                    .setLabel("Block")
                    .setStyle(ButtonStyle.Danger)
            )

        const embed = new EmbedBuilder()
            .setTitle("Appeal:")
            .setColor(appealStateColors[appealState])
            .setTimestamp()
            .addFields({
                name: `Message from **${user?.username ?? authorId}**${user ? ` (${authorId})`: ""}`,
                value:
                    `Sent: ${createdAt}\n` +
                    `Content:\n` +
                    content
            })
        
        const maxFields = 8;
        for (const reply of replyRows) {
            const replyUser = client.users.cache.get(reply.author_id);

            const replyCreatedAt = reply.created_at;
            const replyAuthorId = reply.author_id;
            const replyContent = reply.content;
            const replyType = reply.appeal_reply_type;

            let fieldName = "";
            let fieldValue = "";
            if (replyType == "reply") {
                fieldName = `Reply from **${replyUser?.username ?? replyAuthorId}**${user ? ` (${replyAuthorId})`: ""}`;
                fieldValue =
                    `Sent: ${replyCreatedAt}\n` +
                    `Content:\n` +
                    replyContent;
            } else if (replyType == "status") {
                fieldName = `Status changed by **${replyUser?.username ?? replyAuthorId}**${user ? ` (${replyAuthorId})`: ""}`;
                fieldValue = `Applied: ${replyCreatedAt}\n` + replyContent;
            }

            embed.addFields({
                name: fieldName,
                value: fieldValue
            });

            if (embed.data.fields?.length > maxFields) {
                embed.addFields({
                    name: "Appeal is long!",
                    value: `Due to the length of this appeal, ${replyRows.length - maxFields} message(s) may not be visible.`
                });
                break;
            }
        }

        return [actionBarOne, actionBarTwo, embed];
    }
    
    static readJSON(path) {
        return JSON.parse(readFileSync(path));
    }
}

export default Utils;