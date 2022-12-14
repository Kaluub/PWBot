import { UserData } from "../../classes/data.js";
import { readJSON } from "../../json.js";

export const data = {
    name: 'rewards/add',
    execute: async ({interaction}) => {
        const member = interaction.options.getMember('member');
        if(member.user.bot) return `You can't add rewards to a bot.`;

        const userdata = await UserData.get(member.user.id);
        const rewards = await readJSON('json/rewards.json');

        const reward = interaction.options.getString('reward');
        const item = rewards[reward];

        if(!item) return `No reward found with the name \`${reward}\`.`;

        if(item.type == 'frames' || item.type == 'backgrounds'){
            if(userdata.hasReward(item)) return 'This user has this reward.';
            userdata.addReward(item);
            await UserData.set(member.user.id, userdata);
            return `You gave the ${item.name} to ${member.user.tag}.`;
        } else if(item.type == 'roles'){
            if(interaction.guild.id != '636986136283185172') return 'This reward can only be claimed in the Clash & Harmony discord server!';
            if(await member.roles.cache.has(item.id)) return 'This user has this reward!';
            userdata.unlocked[item.type].push(item.id);
            await UserData.set(member.user.id, userdata);
            await member.roles.add(item.id, `Reward given by ${interaction.user.tag}.`);
            return `You gave the ${item.name} to ${member.user.tag}.`;
        } else {
            return `There was an error rewarding this item.`;
        };
    }
};