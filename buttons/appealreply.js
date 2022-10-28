import { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from "discord.js";

export const data = {
    name: "appealreply",
    execute: async ({interaction, args}) => {
        const modal = new ModalBuilder()
            .setCustomId(`appealreply/${args[0]}/${interaction.message.id}`)
            .setTitle(`Replying to ${args[0]}:`)
        
        const contentInput = new TextInputBuilder()
            .setCustomId(`content`)
            .setLabel("Content:")
            .setPlaceholder("The content of the message to reply with. This will re-open the appeal if it was already closed.")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(200)
            .setRequired(true)
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(contentInput)
        );

        await interaction.showModal(modal);
    }
};