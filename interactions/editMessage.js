import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ApplicationCommandType, ContextMenuCommandBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Locale from "../classes/locale.js";
import Config from "../classes/config.js";

class EditInteraction extends DefaultInteraction {
    static name = "Edit message";
    static guilds = [...Config.HOME_SERVERS];
    static applicationCommand = new ContextMenuCommandBuilder()
        .setDefaultMemberPermissions("0")
        .setName(EditInteraction.name)
        .setType(ApplicationCommandType.Message)

    constructor() {
        super(EditInteraction.name, [InteractionType.ApplicationCommand, InteractionType.ModalSubmit]);
    }

    async execute(interaction) {
        if (!Config.ADMINS.includes(interaction.user.id))
            return {ephemeral: true, content: Locale.text(interaction, "NO_PERMISSION")};
        
        if (interaction.isContextMenuCommand()) {
            const message = interaction.targetMessage;
            await message.fetch();

            if (!message.editable)
                return {ephemeral: true, content: Locale.text(interaction, "EDIT_FAILED")};
            
            const channel = await interaction.client.channels.fetch(message.channelId);
            
            const editModal = new ModalBuilder()
                .setCustomId(`Edit message/${channel.id}/${message.id}`)
                .setTitle("Edit message")
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("content")
                                .setLabel("New message content:")
                                .setValue(message.content || "")
                                .setMaxLength(2000)
                                .setStyle(TextInputStyle.Paragraph)
                        )
                )
            
            return await interaction.showModal(editModal);
        } else if (interaction.isModalSubmit()) {
            let content = interaction.fields.getTextInputValue("content");
            if (!content?.length)
                content = " ";

            const channelId = interaction.customId.split("/")[1];
            const messageId = interaction.customId.split("/")[2];

            try {
                const channel = await interaction.client.channels.fetch(channelId);
                const message = await channel.messages.fetch(messageId);
                message.edit({content});
                return {ephemeral: true, content: Locale.text(interaction, "EDITED_MESSAGE", [message.url])};
            } catch {
                return {ephemeral: true, content: Locale.text(interaction, "EDIT_FAILED")};
            }
        }
    }
}

export default EditInteraction;