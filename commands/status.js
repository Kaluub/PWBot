import { UserData } from "../classes/data.js";
import Locale from "../classes/locale.js";

export const data = {
    name: 'status',
    aliases: ['st'],
    desc: 'This command is used to set your custom status displayed on your profile card.',
    usage: '/status [reset/text (60 character limit)]',
    options: [
        {
            "name": "text",
            "description": "The text you wish to use as your status. 60 characters maximum.",
            "type": "STRING",
            "required": true
        }
    ],
    execute: async ({interaction}) => {
        const guild = interaction.guild;
        const member = interaction.member;
        const status = interaction.options.getString("text")
        let userdata = await UserData.get(member.user.id);
        if(status.length > 60) return `${Locale.text(userdata.settings.locale, "USAGE")}`;
        userdata.status = status;
        await UserData.set(member.user.id, userdata);
        return {
            content: status.length ? Locale.text(userdata.settings.locale, "STATUS_SET", status) : Locale.text(userdata.settings.locale, "STATUS_RESET"), 
            disableMentions: 'all'
        };
    }
};