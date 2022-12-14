import { readJSON } from "../json.js";
import { createProfileCard } from "../functions.js";
import { ApplicationCommandType, AttachmentBuilder } from "discord.js";
import { UserData } from "../classes/data.js";

export const data = {
    name: 'View Profile Card',
    type: ApplicationCommandType.User,
    disabled: true,
    execute: async ({interaction}) => {
        const member = interaction.options.getMember('user');
        if(member.user.bot) return 'That is a bot!';
        
        const rewards = await readJSON('json/rewards.json');
        const userdata = await UserData.get(member.id);
        const buffer = await createProfileCard(member, rewards, userdata);
        const attachment = new AttachmentBuilder(buffer, 'card.png');
        return {content: `Here is ${member.user.username}'s profile card:`, files: [attachment]};
    }
};