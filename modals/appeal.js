import Locale from "../classes/locale.js";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { AppealData } from "../classes/data.js";
import { createAppealEmbed } from "../functions.js";

export const data = {
    name: "appeal",
    execute: async ({interaction, userdata}) => {
        const content = interaction.fields.getTextInputValue("content");

        const replyButton = new ButtonBuilder()
            .setCustomId(`appealreply/${interaction.user.id}`)
            .setLabel("Reply")
            .setStyle("PRIMARY")
        
        const markAsHandlingButton = new ButtonBuilder()
            .setCustomId(`appealhandle`)
            .setLabel("Mark as handling")
            .setStyle("SECONDARY")
        
        const markAsClosedButton = new ButtonBuilder()
            .setCustomId(`appealclose`)
            .setLabel("Close")
            .setStyle("DANGER")
        
        const quickUnbanButton = new ButtonBuilder()
            .setCustomId(`appealunban`)
            .setLabel("Unban")
            .setStyle("SUCCESS")
        
        const quickBlockButton = new ButtonBuilder()
            .setCustomId(`appealblock`)
            .setLabel("Block")
            .setStyle("DANGER")
        
        const quickActionBar1 = new ActionRowBuilder()
            .addComponents(replyButton, markAsHandlingButton, markAsClosedButton)
        
        const quickActionBar2 = new ActionRowBuilder()
            .addComponents(quickUnbanButton, quickBlockButton)
        
        const channel = interaction.client.channels.cache.get(interaction.client.config.modMailChannel);
        const message = await channel.send({content: "Loading...", components: [quickActionBar1, quickActionBar2]});
        const appeal = new AppealData({authorId: interaction.user.id})
            .addMessage(content, interaction.user.id, message.url)
        await AppealData.set(message.id, appeal);
        await message.edit({content: " ", embeds: [createAppealEmbed(appeal, interaction.client)]});
        return {content: Locale.text(userdata.settings.locale, "MODMAIL_SUCCESS"), ephemeral: true};
    }
};