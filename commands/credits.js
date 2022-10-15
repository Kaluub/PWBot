import { EmbedBuilder } from "discord.js";
import Locale from "../classes/locale.js";
import { getDateString, randInt } from "../functions.js";

export const data = {
    name: 'credits',
    noGuild: true,
    desc: 'The movie is over, F. Let\'s go home.',
    usage: '/credits',
    execute: async ({interaction, userdata}) => {
        const embed = new EmbedBuilder()
            .setTitle(Locale.text(userdata.settings.locale, "CREDITS_TITLE"))
            .setColor('#662211')
            .setDescription(Locale.text(userdata.settings.locale, "CREDITS_MAIN"))
            .setFooter({text: Locale.text(userdata.settings.locale, "CREDITS_ENDING")})
        const birthdaysToday = [];
        const todayString = getDateString()
        for(const birthday of interaction.client.json.birthdays) {
            if(todayString.startsWith(birthday.date)) birthdaysToday.push(birthday.name)
        };
        if(birthdaysToday.length && randInt(0, 3) == 0) embed.setFooter({text: Locale.text(userdata.settings.locale, "BIRTHDAY", birthdaysToday[Math.floor(Math.random() * birthdaysToday.length)])})
        return {embeds: [embed]};
    }
};