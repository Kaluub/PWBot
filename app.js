import Client from "./classes/client.js";
import cron from "node-cron";
import { createInterface } from "readline";
import { UserData } from "./classes/data.js";
import UsageLogger from "./classes/usageLogger.js";
import StatusLogger from "./classes/statusLogger.js";
import Locale from "./classes/locale.js";
import * as commands from "./commands.js";

const client = new Client(commands.commands);

UsageLogger.init();
StatusLogger.init();
Locale.reloadLocale();

let statusNum = 0;
const statuses = [
    {name: 'for /help', options: {type: 'WATCHING'}},
    {name: 'for /tutorial', options: {type: 'WATCHING'}}
];

client.on('ready', async () => {
    process.title = `${client.user.username} console`;
    console.log("\x1b[34m\x1b[1m%s\x1b[0m", 'Bot started successfully.');
    readline.prompt();
    StatusLogger.logStatus({type: "start", detail: "The bot was started"});

    /*setInterval(() => {
        client.user.setActivity(statuses[statusNum].name,statuses[statusNum].options);
        statusNum += 1;
        if(statusNum >= statuses.length) statusNum = 0;
    }, 30000);*/

    for(const event of commands.events) {
        if(event.inactive) continue;
        cron.schedule(event.cronTime, async () => await event.execute({channel: client.channels.cache.get(event?.channel), client}), {timezone: "UTC"})
    };
});

client.on('interactionCreate', async (interaction) => {
    if(interaction.isChatInputCommand()){
        let userdata = await UserData.get(interaction.user.id);
        if(userdata.settings.autoLocale) userdata.settings.locale = interaction.locale;
        if(userdata.blocked) return interaction.reply(Locale.text(userdata.settings.locale, "BLOCKED"));
        if(UserData.isLocked(interaction.user.id) && !client.config.admins.includes(interaction.user.id)) return interaction.reply({content: Locale.text(userdata.settings.locale, "DATA_LOCKED"), ephemeral: true});
        const command = commands.commands.get(interaction.commandName.toLowerCase()) || commands.commands.find(cmd => cmd.aliases && cmd.aliases.includes(interaction.commandName.toLowerCase()));
        if(!command) return interaction.reply(Locale.text(userdata.settings.locale, "COMMAND_NOT_FOUND"));
        if(command.admin && !client.config.admins.includes(interaction.user.id)) return interaction.reply(Locale.text(userdata.settings.locale, "ADMIN_ERROR"));
        if(command.feature && (!userdata.unlocked.features.includes(command.feature) || !client.config.admins.includes(interaction.user.id))) return interaction.reply(Locale.text(userdata.settings.locale, "PERMISSION_ERROR"));
        if(!interaction.guild && !command.noGuild) return interaction.reply(Locale.text(userdata.settings.locale, "DM_ERROR"));
        userdata.addStatistic('commandsUsed');
        await UserData.set(interaction.user.id, userdata);
        UsageLogger.logAction({guildId: interaction.guildId, channelId: interaction.channelId, userId: interaction.user.id, actionName: interaction.toString()});
        try{
            await command.execute({interaction, userdata}).then(async res => {
                if(res && interaction && !interaction.replied) await interaction.reply(res);
                else if(interaction && !interaction.replied) await interaction.reply(Locale.text(userdata.settings.locale, "ERROR"));
                readline.prompt(true);
            });
        } catch(error){
            console.error(error);
            readline.prompt(true);
            StatusLogger.logStatus({type: "command-error", detail: error});
        };
    } else if(interaction.isContextMenuCommand()) {
        let userdata = await UserData.get(interaction.user.id);
        if(userdata.blocked) return await interaction.reply({content: Locale.text(interaction.locale, "BLOCKED"), ephemeral: true});
        if(UserData.isLocked(interaction.user.id) && !client.config.admins.includes(interaction.user.id)) return interaction.reply({content: 'Unable to use this command: Your data is locked, are you in a trade?', ephemeral: true});
        const command = commands.contexts.get(interaction.commandName) || commands.contexts.find(cmd => cmd.aliases && cmd.aliases.includes(interaction.commandName));
        if(!command) return interaction.reply(Locale.text(userdata.settings.locale, "COMMAND_NOT_FOUND"));
        if(command.admin && !client.config.admins.includes(interaction.user.id)) return interaction.reply({content: Locale.text(userdata.settings.locale, "ADMIN_ERROR"), ephemeral: true});
        if(command.feature && (!userdata.unlocked.features.includes(command.feature) || !client.config.admins.includes(interaction.user.id))) return interaction.reply(Locale.text(userdata.settings.locale, "PERMISSION_ERROR"));
        if(!interaction.guild && !command.noGuild) return interaction.reply(Locale.text(userdata.settings.locale, "DM_ERROR"));
        if(userdata.settings.autoLocale) userdata.settings.locale = interaction.locale;
        userdata.addStatistic('commandsUsed');
        await UserData.set(interaction.user.id, userdata);
        UsageLogger.logAction({guildId: interaction.guildId, channelId: interaction.channelId, userId: interaction.user.id, actionName: interaction.commandName});
        try {
            await command.execute({interaction, userdata}).then(async res => {
                if(res && !interaction.replied) await interaction.reply(res);
                else if(!interaction.replied) interaction.reply(Locale.text(userdata.settings.locale, "ERROR"));
                readline.prompt(true);
            });
        } catch(error){
            console.error(error);
            readline.prompt(true);
            StatusLogger.logStatus({type: "command-error", detail: error});
        };
    } else if(interaction.isAutocomplete()) {
        const option = interaction.options.getFocused(true);
        const autocompleter = commands.autoCompletes.get(option.name);
        if(!autocompleter) return await interaction.respond([]);
        try {
            const res = await autocompleter.execute({interaction});
            if(res) await interaction.respond(res);
            else await interaction.respond([]);
        } catch(error){
            console.error(error);
            readline.prompt(true);
            StatusLogger.logStatus({type: "autocomplete-error", detail: error});
        };
    } else if(interaction.isModalSubmit()) {
        const args = interaction.customId.split("/");
        const modalName = args.shift();
        const modal = commands.modals.get(modalName);
        if(!modal) return await interaction.reply({content: Locale.text(interaction.locale, "COMMAND_NOT_FOUND"), ephemeral: true});
        const userdata = await UserData.get(interaction.user.id);
        if (userdata.blocked) return await interaction.reply({content: Locale.text(interaction.locale, "BLOCKED"), ephemeral: true});
        try {
            const res = await modal.execute({interaction, userdata, args});
            if(res) await interaction.reply(res);
        } catch(error){
            console.error(error);
            readline.prompt(true);
            StatusLogger.logStatus({type: "modal-error", detail: error});
        };
    } else if(interaction.isMessageComponent() && interaction.isButton()){
        const args = interaction.customId.split("/");
        const buttonName = args.shift();
        const button = commands.buttons.get(buttonName);
        if(!button) return await interaction.reply({content: Locale.text(interaction.locale, "COMMAND_NOT_FOUND"), ephemeral: true});
        const userdata = await UserData.get(interaction.user.id);
        if (userdata.blocked) return await interaction.reply({content: Locale.text(interaction.locale, "BLOCKED"), ephemeral: true});
        try {
            const res = await button.execute({interaction, userdata, args});
            if(res) await interaction.reply(res);
        } catch(error){
            console.error(error);
            readline.prompt(true);
            StatusLogger.logStatus({type: "button-error", detail: error});
        };
    };
});

function completer(line){
    const completions = [];
    for(const [key, cmd] of commands.consoleCommands.entries()){
        if(!cmd) continue;
        completions.push(cmd.name);
    };
    const hits = completions.filter((c) => c.startsWith(line));
    return [hits.length ? hits : completions, line];
};

const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: completer
});

readline.on('line', async line => { // Console commands:
    const args = line.split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = commands.consoleCommands.get(commandName) || commands.consoleCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if(command){
        try {
            await command.execute({
                client,
                args,
                line,
                commands: commands.consoleCommands,
                discordCommands: commands.commands,
                readline: readline
            });
        } catch(error) {
            StatusLogger.logStatus({type: "console-error", detail: error});
            console.error(error);
        };
    } else {
        console.log(`There is no command: ${commandName}`);
    };
    readline.prompt();
}).on('close', () => {
    StatusLogger.logStatus({type: "shutdown", detail: "The bot was shut down"});
    console.log("\x1b[31m\x1b[1m%s\x1b[0m", `Shutting down ${client.user.username}.`);
    client.destroy();
    process.exit(0);
});

client.login(client.config.token);