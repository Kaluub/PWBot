import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Utils from "../classes/utils.js";
import Config from "../classes/config.js";

class CreateAppealInteraction extends DefaultInteraction {
    static name = "create-appeal";

    constructor() {
        super(CreateAppealInteraction.name, [InteractionType.MessageComponent, InteractionType.ModalSubmit]);
    }

    async execute(interaction) {
        if (interaction.isMessageComponent()) {
            const modal = new ModalBuilder()
                .setCustomId("create-appeal")
                .setTitle("Write appeal")
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("content")
                                .setLabel("Appeal message:")
                                .setPlaceholder("Type in your appeal using the format above.")
                                .setMinLength(50)
                                .setMaxLength(1000)
                                .setStyle(TextInputStyle.Paragraph)
                        )
                )
            
            return await interaction.showModal(modal);
        } else if (interaction.isModalSubmit()) {
            const content = interaction.fields.getTextInputValue("content");
            
            const [actionBarOne, actionBarTwo, embed] = Utils.createAppealMessage(
                interaction.client,
                new Date(),
                interaction.user.id,
                content,
                "open",
                []
            );
            
            const channel = interaction.client.channels.cache.get(Config.APPEAL_CHANNEL);
            const message = await channel.send({
                embeds: [embed],
                components: [actionBarOne, actionBarTwo]
            });

            await interaction.client.storage.createAppeal(message.id, interaction.user.id, content);

            return {ephemeral: true, content: "Appeal submitted. Please wait patiently for a response."};
        }
    }
}

export default CreateAppealInteraction;