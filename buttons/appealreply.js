import { Modal, TextInputComponent, MessageActionRow } from "discord.js";
import Locale from "../classes/locale.js";

export const data = {
    name: "appealreply",
    execute: async ({interaction, args}) => {
        const modal = new Modal()
            .setCustomId(`appealreply/${args[0]}/${interaction.message.id}`)
            .setTitle(`Replying to ${args[0]}:`)
        
        const contentInput = new TextInputComponent()
            .setCustomId(`content`)
            .setLabel("Content:")
            .setPlaceholder("The content of the message to reply with.")
            .setStyle("PARAGRAPH")
            .setRequired(true)
        
        modal.addComponents(
            new MessageActionRow().addComponents(contentInput)
        );

        return await interaction.showModal(modal);
    }
};