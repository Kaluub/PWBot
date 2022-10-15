import { AppealData, AppealStatus, AppealMessageType } from "../classes/data.js";
import { createAppealEmbed } from "../functions.js";

export const data = {
    name: "appealclose",
    execute: async ({interaction, args}) => {
        let appeal = await AppealData.get(interaction.message.id);
        if (appeal.status == AppealStatus.CLOSED) return {ephemeral: true, content: "This appeal is already closed"}
        appeal.status = AppealStatus.CLOSED;
        appeal.addMessage("Marked as closed", interaction.user.id, null, AppealMessageType.STATUS);
        await AppealData.set(interaction.message.id, appeal);
        await interaction.update({embeds: [createAppealEmbed(appeal)]});
        await interaction.followUp({ephemeral: true, content: "Marked as closed"});
    }
};