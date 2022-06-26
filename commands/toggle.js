import { readJSON } from "../json.js";
import Locale from "../classes/locale.js";

export const data = {
    name: 'toggle',
    desc: `A command for toggling some specific roles, used for pings.`,
    usage: '/toggle [todo]',
    options: [
        {
            "name": "role",
            "description": "Choose which role to toggle.",
            "type": "STRING",
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