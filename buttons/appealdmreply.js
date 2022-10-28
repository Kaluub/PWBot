import { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from "discord.js";

export const data = {
    name: "appealdmreply",
    execute: async ({interaction, args}) => {
        const modal = new ModalBuilder()
            .setCustomId(`appealdmreply/${args[0]}`)
            .setTitle(`Reply:`)
        
        const contentInput = new TextInputBuilder()
            .setCustomId(`content`)
            .setLabel("Content:")
            .setPlaceholder("Type your reply to the staff team here.")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(200)
            .setRequired(true)
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(contentInput)
        );

        await interaction.showModal(modal);
    }
};