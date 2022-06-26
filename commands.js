import { readdirSync } from "fs";
import { Collection } from "discord.js";

function dirToCollection(path) {
    const col = new Collection();
    const files = readdirSync(path).filter(file => file.endsWith('.js'));
    files.forEach(async file => {
        const { data } = await import(`./${path}/${file}`);
        if(!data.archived) col.set(data.name, data);
    });
    return col;
};

const commands = dirToCollection('./commands');
const contexts = dirToCollection('./contexts');
const consoleCommands = dirToCollection('./console');
const autoCompletes = dirToCollection('./autocompletes');
const modals = dirToCollection('./modals');

const events = [];
const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'));
for(const file of eventFiles){
    const { data } = await import(`./events/${file}`);
    events.push(data);
};

export { commands, contexts, consoleCommands, autoCompletes, modals, events };