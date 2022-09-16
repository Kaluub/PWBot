import { AppealData, AppealStatus } from "../classes/data.js";

export const data = {
    name: "appealunban",
    execute: async ({interaction, args}) => {
        let appeal = await AppealData.get(args[0]);
        appeal.status = AppealStatus.CLOSED;
        appeal.addMessage("Unbanned & marked as closed", interaction.user.id, null);
        await AppealData.set(args[0], appeal);
        return {ephemeral: true, content: "Marked as closed (manually unban for now)"}
    }
};