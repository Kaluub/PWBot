import { AppealData, AppealMessageType, AppealStatus } from "../classes/data.js";
import { createAppealEmbed } from "../functions.js";

export const data = {
    name: "appealdmreply",
    execute: async ({interaction, args}) => {
        const content = interaction.fields.getTextInputValue("content");
        const channel = interaction.client.channels.cache.get(interaction.client.config.modMailChannel);
        const message = await channel.messages.fetch(args[0]);
        let appeal = await AppealData.get(message.id);
        if (appeal.status == AppealStatus.CLOSED) {
            await interaction.update({components: []});
            await interaction.followUp({content: "This appeal has already been closed! Apologies for the inconvenience.", ephemeral: true});
            return;
        };
        appeal.addMessage(content, interaction.user.id, null, AppealMessageType.REPLY);
        await AppealData.set(message.id, appeal);
        await message.edit({embeds: [createAppealEmbed(appeal, interaction.client)]});
        await interaction.update({components: []});
        await interaction.followUp({content: "Your reply has been sent to the staff team.", ephemeral: true});
    }
};