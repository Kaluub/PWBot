import { AppealData, AppealStatus, AppealMessageType } from "../classes/data.js";
import { createAppealEmbed } from "../functions.js";
import { UserData } from "../classes/data.js";

export const data = {
    name: "appealblock",
    execute: async ({interaction, args}) => {
        let appeal = await AppealData.get(interaction.message.id);
        appeal.status = AppealStatus.CLOSED;
        appeal.addMessage("Marked as closed & blocked user from accessing the bot", interaction.user.id, null, AppealMessageType.STATUS);
        let userdata = await UserData.get(appeal.messages[0].authorId);
        userdata.setBlocked(true);
        await UserData.set(appeal.messages[0].authorId, userdata)
        await AppealData.set(interaction.message.id, appeal);
        await interaction.update({embeds: [createAppealEmbed(appeal, interaction.client)]})
        await interaction.followUp({ephemeral: true, content: "Marked as closed & blocked"});
    }
};