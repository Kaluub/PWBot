import { AppealData, AppealStatus, AppealMessageType } from "../classes/data.js";
import { createAppealEmbed } from "../functions.js";

export const data = {
    name: "appealhandle",
    execute: async ({interaction, args}) => {
        let appeal = await AppealData.get(interaction.message.id);
        if (appeal.status == AppealStatus.IN_PROGRESS || appeal.status == AppealStatus.CLOSED) return {ephemeral: true, content: "This appeal is already being handled or is closed"}
        appeal.status = AppealStatus.IN_PROGRESS;
        appeal.addMessage("Marked as in progress", interaction.user.id, null, AppealMessageType.STATUS);
        await AppealData.set(interaction.message.id, appeal);
        await interaction.update({embeds: [createAppealEmbed(appeal, interaction.client)]})
        await interaction.followUp({ephemeral: true, content: "Marked as handling"});
    }
};