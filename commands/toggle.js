import Locale from "../classes/locale.js";
import { ApplicationCommandOptionType } from "discord.js";

export const data = {
    name: 'toggle',
    desc: `A command for toggling some specific roles, used for pings.`,
    usage: '/toggle [todo]',
    disabled: true,
    options: [
        {
            "name": "role",
            "description": "Choose which role to toggle.",
            "type": ApplicationCommandOptionType.String,
            "required": true,
            "choices": [
                {
                    "name": "TODO",
                    "value": "todo"
                }
            ]
        }
    ],
    execute: async ({userdata}) => {
        return Locale.text(userdata.settings.locale, "TODO");
    }
};