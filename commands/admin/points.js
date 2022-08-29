import { UserData } from "../../classes/data.js";

export const data = {
    name: 'points',
    execute: async ({interaction}) => {
        const user = interaction.options.getUser('member');
        const points = interaction.options.getInteger('points');
        const force = interaction.options.getBoolean('force-set', false);
        const userdata = await UserData.get(user.id);
        if(force){
            userdata.setPoints(points);
        } else {
            userdata.addPoints(points);
        };
        await UserData.set(user.id, userdata);
        return force ? `Successfully set ${user.tag} points to ${points}.` : `Successfully added ${points} points to ${user.tag}.`;
    }
};