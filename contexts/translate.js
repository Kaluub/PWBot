import translate from "@vitalets/google-translate-api";
import Locale from "../classes/locale.js";
import { ApplicationCommandType } from "discord.js";

export const data = {
    name: 'Translate to English',
    type: ApplicationCommandType.Message,
    execute: async ({interaction, userdata}) => {
        if(!interaction.targetMessage.content.length) return {content: Locale.text(userdata.settings.locale, "TRANSLATE_FAILED"), ephemeral: true}; 
        const res = await translate(interaction.targetMessage.content, {to: "en"});
        if(res) {
            return {
                content: Locale.text(userdata.settings.locale, "TRANSLATE_TRANSLATED", interaction.targetMessage.author.tag, res.from.language.iso, res.text),
                ephemeral: true
            };
        } else return {content: Locale.text(userdata.settings.locale, "TRANSLATE_FAILED"), ephemeral: true};
    }
};