import { AppealData, AppealStatus, AppealMessageType } from "../classes/data.js";
import { createAppealEmbed } from "../functions.js";

export const data = {
    name: "appealunban",
    execute: async ({interaction, args}) => {
        let appeal = await AppealData.get(interaction.message.id);
        appeal.status = AppealStatus.CLOSED;
        appeal.addMessage("Marked as closed & unbanned", interaction.user.id, null, AppealMessageType.STATUS);
        await AppealData.set(interaction.message.id, appeal);
        await interaction.update({embeds: [createAppealEmbed(appeal, interaction.client)]})
        await interaction.followUp({ephemeral: true, content: "Marked as closed (manually unban for now)"});
    }
};