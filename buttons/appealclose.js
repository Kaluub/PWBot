import { AppealData, AppealStatus } from "../classes/data.js";

export const data = {
    name: "appealclose",
    execute: async ({interaction, args}) => {
        let appeal = await AppealData.get(args[0]);
        appeal.status = AppealStatus.CLOSED;
        appeal.addMessage("Marked as closed", interaction.user.id, null);
        await AppealData.set(args[0], appeal);
        return {ephemeral: true, content: "Marked as closed"}
    }
};