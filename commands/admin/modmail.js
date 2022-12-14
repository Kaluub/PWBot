import { readJSON, writeJSON } from "../../json.js";

export const data = {
    name: 'modmail',
    execute: async ({interaction}) => {
        let channel = interaction?.options.getChannel('channel');
        let config = await readJSON('config.json');
        config.modMailChannel = new String(channel.id);
        writeJSON('config.json', config);
        interaction.client.reloadConfig()
        return `Successfully set the mod-mail channel to ${channel}.`;
    }
};