import { UserData } from "../classes/data.js";
import Locale from "../classes/locale.js";

export const data = {
    name: 'monthly',
    aliases: ['m'],
    desc: `This is a command for earning your monthly rewards.`,
    usage: '/monthly',
    execute: async ({interaction}) => {
        const guild = interaction.guild;
        const member = interaction.member;
        let userdata = await UserData.get(member.user.id);

        if(userdata.monthlyCooldown > Date.now()){
            let timeRemaining = userdata.monthlyCooldown - Date.now();
            let totalSeconds = (timeRemaining / 1000);
            let days = Math.floor(totalSeconds / 86400);
            totalSeconds %= 86400;
            let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            let minutes = Math.floor(totalSeconds / 60);
            return Locale.text(userdata.settings.locale, "MONTHLY_COOLDOWN", days, hours, minutes);
        };

        userdata.monthlyCooldown = Date.now() + 2592000000;
        if(userdata.unlocked.features.includes('MONTHLY_COOLDOWN_10')) userdata.monthlyCooldown -= 259200000;
        if(userdata.unlocked.features.includes('DEBUG')) userdata.monthlyCooldown = 1;

        let earnedPoints = 20;
        let msg = Locale.text(userdata.settings.locale, "MONTHLY_DEFAULT");

        if(member.roles.premiumSubscriberRole){
            earnedPoints += 50;
            msg += Locale.text(userdata.settings.locale, "MONTHLY_NITRO");
        };

        if(Math.random() > 0.4){
            let bonusPoints = Math.floor(Math.random() * 10 + 1);
            earnedPoints += bonusPoints;
            msg += Locale.text(userdata.settings.locale, "MONTHLY_RANDOM", bonusPoints);
        };

        if(userdata.unlocked.features.includes('MONTHLY_20')){
            let bonusPoints = Math.floor(0.2 * earnedPoints);
            earnedPoints *= 1.2;
            msg += Locale.text(userdata.settings.locale, "MONTHLY_BOOST", bonusPoints);
        };

        msg += Locale.text(userdata.settings.locale, "MONTHLY_CONCLUSION", Math.floor(earnedPoints));
        userdata.points += Math.floor(earnedPoints);
        userdata.statistics.earned += earnedPoints;
        await UserData.set(member.user.id, userdata);
        return msg;
    }
};