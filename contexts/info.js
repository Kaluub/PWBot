import { ApplicationCommandType } from "discord.js";
import { UserData } from "../classes/data.js";

function fix(num){
    return Math.floor(num / 1000)
};

export const data = {
    name: 'Info',
    type: ApplicationCommandType.User,
    execute: async ({interaction}) => {
        const member = interaction.options.getMember('user');
        const user = interaction.options.getUser('user');
        const userdata = await UserData.get(user.id);

        const content = `Here is some data regarding ${user?.tag}:\n\nID: ${user?.id}\nJoined Discord: <t:${fix(user?.createdTimestamp)}> (<t:${fix(user?.createdTimestamp)}:R>)\nJoined server: <t:${fix(member?.joinedTimestamp)}> (<t:${fix(member?.joinedTimestamp)}:R>)\nLocale: ${userdata.settings.locale}\n\nRestricted: ${userdata.blocked ? 'Yes' : 'No'}\nPoints: ${userdata.points}\nStatus: \`${userdata.status}\``;
        return {content, ephemeral: true};
    }
};