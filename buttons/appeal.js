import { ModalBuilder, TextInputBuilder, ActionRowBuilder } from "discord.js";
import Locale from "../classes/locale.js";

export const data = {
    name: "appeal",
    execute: async ({interaction, userdata}) => {
        const modal = new ModalBuilder()
            .setCustomId("appeal")
            .setTitle(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_TITLE"))
        
        const contentInput = new TextInputBuilder()
            .setCustomId("content")
            .setLabel(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_LABEL_2"))
            .setPlaceholder(Locale.text(userdata.settings.locale, "MODMAIL_MODAL_PLACEHOLDER_2"))
            .setMinLength(50)
            .setMaxLength(800)
            .setStyle("PARAGRAPH")
            .setRequired(true)
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(contentInput)
        );

        return await interaction.showModal(modal);
    }
};