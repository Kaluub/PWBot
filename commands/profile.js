import { createProfileCard } from "../functions.js";
import { readJSON } from "../json.js";
import { MessageAttachment } from "discord.js";
import { UserData } from "../classes/data.js";
import Locale from "../classes/locale.js";

export const data = {
    name: 'profile',
    aliases: ['p'],
    desc: 'This is a command for displaying your profile card.',
    usage: '/profile',
    options: [
        {
            "name": "member",
            "description": "The member whos card to display.",
            "type": "USER",
            "required": false
        }
    ],
    execute: async ({interaction}) => {
        const member = interaction.options.getMember("member") ?? interaction.member;
        const self = interaction.member;
        const guild = interaction.guild;

        const selfdata = await UserData.get(self.user.id);
        let userdata = await UserData.get(member.user.id);
        let rewards = await readJSON('json/rewards.json');

        let msg = `${Math.random() < 0.05 ? Locale.text(selfdata.settings.locale, "PROFILE_TIPS") : ''}${Locale.text(selfdata.settings.locale, "PROFILE_CARD")}`;
        // Luck minigame:
        if(Math.random < 0.005){
            if(selfdata.unlocked.frames.includes('golden_frame')){
                let luckyPoints = Math.floor(Math.random() * (50 - 20 + 1) + 20);
                if(luckyPoints == 50) msg = Locale.text(selfdata.settings.locale, "PROFILE_JACKPOT", luckyPoints);
                else msg = Locale.text(selfdata.settings.locale, "PROFILE_LUCKY", luckyPoints);
                selfdata.points += luckyPoints;
                selfdata.statistics.earned += luckyPoints;
            } else {
                msg = Locale.text(selfdata.settings.locale, "PROFILE_GOLDEN_FRAME");
                selfdata.unlocked.frames.push('golden_frame');
            };
            await UserData.set(self.user.id, selfdata);
        };

        const buffer = await createProfileCard(member, rewards, userdata);
        const attachment = new MessageAttachment(buffer, `card-of-${member.user.id}.png`);
        return {content: msg, files:[attachment]};
    }
};