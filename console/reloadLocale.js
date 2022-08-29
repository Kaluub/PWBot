import Locale from "../classes/locale.js";

export const data = {
    name: 'reloadlocale',
    usage: 'reloadlocale',
    async execute(){
        Locale.reloadLocale();
        console.log("Reloaded locale.")
    }
};