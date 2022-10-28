import Locale from "../classes/locale.js";
import { ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandType, TextInputStyle } from "discord.js";

export const data = {
    name: 'Edit message',
    type: ApplicationCommandType.Message,
    admin: true,
    execute: async ({interaction, userdata}) => {
        if(!interaction.targetMessage.editable) return Locale.text(userdata.settings.locale, "EDIT_NOT_EDITABLE");
        const editModal = new ModalBuilder()
            .setCustomId(`edit/${interaction.targetMessage.channel.id}/${interaction.targetMessage.id}`)
            .setTitle("Edit message")
        
        const contentInput = new TextInputBuilder()
            .setCustomId("edit-content")
            .setLabel(Locale.text(userdata.settings.locale, "EDIT_MODAL_LABEL_1"))
            .setPlaceholder(Locale.text(userdata.settings.locale, "EDIT_MODAL_PLACEHOLDER_1"))
            .setValue(interaction.targetMessage.content)
            .setMaxLength(2000)
            .setStyle(TextInputStyle.Paragraph)

        editModal.addComponents(
            new ActionRowBuilder().addComponents(contentInput)
        );

        return await interaction.showModal(editModal);
    }
};