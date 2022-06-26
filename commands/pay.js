import { UserData } from "../classes/data.js";
import Locale from "../classes/locale.js";

export const data = {
    name: 'pay',
    aliases: ['give','send'],
    desc: 'This command is used to circulate points between users.',
    usage: '/pay [points] [@user/user name]',
    options: [
        {
            "name": "member",
            "description": "The member to give your points to.",
            "type": "USER",
            "required": true
        },
        {
            "name": "points",
            "description": "The amount of points to give this member.",
            "type": "INTEGER",
            "required": true
        }
    ],
    execute: async ({interaction}) => {
        const self = interaction.member;
        const guild = interaction.guild;
        let userdata = await UserData.get(guild.id, self.user.id);
        const count = interaction.options.getInteger("points");
        const member = interaction.options.getMember("member");
        if(!member) return Locale.text(userdata.settings.locale, "PAY_INVALID_USER");
        if(member.user.bot) return Locale.text(userdata.settings.locale, "PAY_NO_BOT");

        if(isNaN(count) || count < 1)
            if(!interaction.client.config.admins.includes(member.user.id))
                return Locale.text(userdata.settings.locale, "PAY_INVALID_NUMBER");

        if(self.user.id == member.user.id) return Locale.text(userdata.settings.locale, "PAY_NO_SELF");

        if(Date.now() - userdata.statistics.age < 1210000000) return Locale.text(userdata.settings.locale, "PAY_COOLDOWN");
        if(userdata.points < count) return Locale.text(userdata.settings.locale, "PAY_USER_BROKE", count - userdata.points);
        
        let userdata2 = await UserData.get(guild.id, member.user.id);
        
        userdata.points -= count;
        userdata2.points += count;
        await UserData.set(guild.id, self.user.id, userdata);
        await UserData.set(guild.id, member.user.id, userdata2);
        return Locale.text(userdata.settings.locale, "PAY_SUCCESS", count, member.user.username, userdata.points);
    }
};