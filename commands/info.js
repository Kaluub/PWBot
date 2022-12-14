import { readJSON } from "../json.js";
import { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } from "discord.js";
import Locale from "../classes/locale.js";
import { UserData } from "../classes/data.js";

export const data = {
    name: 'info',
    aliases: ['i'],
    desc: `This is a command for viewing the info of a reward.`,
    usage: '/info [reward name]',
    disabled: true,
    options: [
        {
            "name": "reward",
            "description": "The reward name to view the info for.",
            "type": ApplicationCommandOptionType.String,
            "autocomplete": true,
            "required": true
        }
    ],
    execute: async ({interaction, userdata}) => {
        const rewards = await readJSON('json/rewards.json');
        const reward = interaction.options.getString('reward');
        const item = rewards[reward];
        
        if(!item) return `No reward found with the name \`${reward}\`.`;

        let query = {"_id": { $regex: new RegExp(`^${interaction.guild.id}`)}};
        query[`unlocked.${item.type}`] = item.id;
        const count = await UserData.searchCount(query);

        const embed = new EmbedBuilder()
            .setColor('#662211')
            .setTitle(Locale.text(userdata.settings.locale, "INFO_TITLE", item.name))
            .setDescription(Locale.text(userdata.settings.locale, "INFO_DESC", item.name, item.desc ? item.desc : Locale.text(userdata.settings.locale, "INFO_NO_DESC"), item.price, count))

        let message = {embeds: [embed]};

        if(item.img) {
            const attachment = new AttachmentBuilder(`./img/${item.type}/${item.img}`);
            embed.setImage(`attachment://${item.img}`);
            message["files"] = [attachment];
        };

        return message;
    }
};