import Client from './classes/client.js';
import StatusLogger from "./classes/statusLogger.js";
import { readdirSync } from "fs";

const interactions = [];

const channelCommandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));
const contextInteractionFiles = readdirSync('./contexts').filter(file => file.endsWith('.js'));

for (const file of channelCommandFiles) {
    const { data } = await import(`./commands/${file}`);
    if(data.hidden || data.archived || data.noInteraction) continue;
    interactions.push({
        name: data.name,
        description: data.desc,
        options: data.options ? data.options : undefined
    });
};

for (const file of contextInteractionFiles) {
    const { data } = await import(`./contexts/${file}`);
    if(data.hidden) continue;
    interactions.push({
        type: data.type,
        name: data.name
    });
};

const client = new Client({intents: []});
client.login(client.config.token);

client.on('ready', async () => {
    await client.application.fetch();
    console.log(interactions);
    await client.application.commands.set(interactions).catch(err => console.error(err));
    StatusLogger.logStatus({type: "update-interactions", detail: "All interactions were updated"});
    console.log('Done!');
    client.destroy();
    process.exit(0);
});