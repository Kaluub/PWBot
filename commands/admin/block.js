import { UserData } from "../../classes/data.js";

export const data = {
    name: 'block',
    execute: async ({interaction}) => {
        const user = interaction.options.getUser('member');
        const userdata = await UserData.get(user.id);
        userdata.setBlocked(!userdata.blocked);
        await UserData.set(user.id, userdata);
        return {content: `${user.tag} was ${userdata.blocked ? "blocked" : "unblocked"}.`, ephemeral: true};
    }
};