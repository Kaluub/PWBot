import { Modal, TextInputComponent, MessageActionRow } from "discord.js";
import Locale from "../classes/locale.js";

export const data = {
    name: "modmail",
    execute: async ({interaction, userdata}) => {
        const modal = new Modal()
            .setCustomId("modmail")
            .setTitle(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_TITLE"))
        
        const questionInput = new TextInputComponent()
            .setCustomId("category")
            .setLabel(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_LABEL_1"))
            .setPlaceholder(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_PLACEHOLDER_1"))
            .setMaxLength(50)
            .setStyle("SHORT")
            .setRequired(true)
        
        const optionsInput = new TextInputComponent()
            .setCustomId("content")
            .setLabel(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_LABEL_2"))
            .setPlaceholder(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_PLACEHOLDER_2"))
            .setMinLength(50)
            .setMaxLength(1000)
            .setStyle("PARAGRAPH")
            .setRequired(true)
        
        modal.addComponents(
            new MessageActionRow().addComponents(questionInput),
            new MessageActionRow().addComponents(optionsInput)
        );

        return await interaction.showModal(modal);
    }
};