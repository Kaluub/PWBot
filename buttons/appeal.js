import { Modal, TextInputComponent, MessageActionRow } from "discord.js";
import Locale from "../classes/locale.js";

export const data = {
    name: "appeal",
    execute: async ({interaction, userdata}) => {
        const modal = new Modal()
            .setCustomId("appeal")
            .setTitle(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_TITLE"))
        
        const categoryInput = new TextInputComponent()
            .setCustomId("category")
            .setLabel(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_LABEL_1"))
            .setPlaceholder(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_PLACEHOLDER_1"))
            .setMaxLength(50)
            .setStyle("SHORT")
            .setRequired(true)
        
        const contentInput = new TextInputComponent()
            .setCustomId("content")
            .setLabel(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_LABEL_2"))
            .setPlaceholder(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_PLACEHOLDER_2"))
            .setMinLength(50)
            .setMaxLength(1000)
            .setStyle("PARAGRAPH")
            .setRequired(true)
        
        modal.addComponents(
            new MessageActionRow().addComponents(categoryInput),
            new MessageActionRow().addComponents(contentInput)
        );

        return await interaction.showModal(modal);
    }
};