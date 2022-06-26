import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import Locale from "../classes/locale.js";

function baseEmbed(locale){
    return new MessageEmbed()
        .setTitle(Locale.text(locale, "HELP_TITLE"))
        .setDescription(Locale.text(locale, "HELP_DESC"))
        .setColor('BLURPLE')
};

export const data = {
    name: 'help',
    aliases: ['?'],
    desc: 'A list of every command.',
    usage: '/help [command]',
    execute: async ({interaction, userdata}) => {
        const user = interaction.user;

        // Construct help menu:
        const embeds = [baseEmbed(userdata.settings.locale)];
        let currentEmbed = 0;
        let currentEmbedCommands = 0;

        for(const [key, cmd] of interaction.client.commands.entries()){
            if(!cmd) continue;
            if(cmd.hidden) continue;
            if(cmd.admin && !interaction.client.config.admins.includes(user.id)) continue;
            if(cmd.feature && (!userdata.unlocked.features.includes(cmd.feature) || !interaction.client.config.admins.includes(user.id))) continue;

            if(currentEmbedCommands >= 7){
                embeds.push(baseEmbed(userdata.settings.locale));
                currentEmbed += 1;
                currentEmbedCommands = 0;
            };

            embeds[currentEmbed].setDescription(embeds[currentEmbed].description + Locale.text(userdata.settings.locale, "HELP_ENTRY", cmd.name, cmd.desc, cmd.usage));
            currentEmbedCommands += 1;
        };

        // Handle pages:
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('back')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_BACK"))
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('next')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_NEXT"))
                .setStyle('PRIMARY')
        );

        let page = 0;
        const msg = await interaction.reply({embeds: [embeds[page].setFooter({text: `${Locale.text(userdata.settings.locale, "PAGE")}: ${page + 1}/${embeds.length}`})], components: [row], fetchReply: true});

        const collector = msg.createMessageComponentCollector({filter: interaction => interaction.user.id == user.id, idle: 30000});
        collector.on('collect', async (interaction) => {
            if(interaction.customId == 'back') page -= 1;
            if(interaction.customId == 'next') page += 1;
            if(page < 0) page = embeds.length - 1;
            if(page >= embeds.length) page = 0;
            await interaction.update({embeds: [embeds[page].setFooter({text: `${Locale.text(userdata.settings.locale, "PAGE")}: ${page + 1}/${embeds.length}`})]});
        });
        collector.on('end', async () => {
            if(msg.editable) await msg.edit({embeds: [embeds[page].setFooter({text: `${Locale.text(userdata.settings.locale, "PAGE")}: ${page + 1}/${embeds.length} | ${Locale.text(userdata.settings.locale, "EXPIRED")}`})], components: []});
        });
    }
};