import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import Locale from "../classes/locale.js";

export const data = {
    name: 'tutorial',
    aliases: ['tut'],
    desc: 'This command is used to view the tutorial.',
    usage: '/tutorial',
    disabled: true,
    execute: async ({interaction, userdata}) => {
        const embeds = [
            new EmbedBuilder()
                .setTitle(Locale.text(userdata.settings.locale, "TUTORIAL"))
                .setColor(`#FF6961`)
                .setDescription(Locale.text(userdata.settings.locale, "TUTORIAL_DESC")),
            new EmbedBuilder()
                .setTitle(`${Locale.text(userdata.settings.locale, "TUTORIAL")}: ${Locale.text(userdata.settings.locale, "TUTORIAL_TITLE_1")}`)
                .setColor(`#FFB347`)
                .setDescription(Locale.text(userdata.settings.locale, "TUTORIAL_DESC_1"))
                .setImage(`https://cdn.discordapp.com/attachments/822280580577361941/870739087852728490/unknown.png`),
            new EmbedBuilder()
                .setTitle(`${Locale.text(userdata.settings.locale, "TUTORIAL")}: ${Locale.text(userdata.settings.locale, "TUTORIAL_TITLE_2")}`)
                .setColor(`#FDFD96`)
                .setDescription(Locale.text(userdata.settings.locale, "TUTORIAL_DESC_2"))
                .setImage(`https://cdn.discordapp.com/attachments/807311206888636457/829523758363967529/Card_Diagram.png`),
            new EmbedBuilder()
                .setTitle(`${Locale.text(userdata.settings.locale, "TUTORIAL")}: ${Locale.text(userdata.settings.locale, "TUTORIAL_TITLE_3")}`)
                .setColor(`#77DD77`)
                .setDescription(Locale.text(userdata.settings.locale, "TUTORIAL_DESC_3"))
                .setImage(`https://cdn.discordapp.com/attachments/822280580577361941/870742292145778699/unknown.png`),
            new EmbedBuilder()
                .setTitle(`${Locale.text(userdata.settings.locale, "TUTORIAL")}: ${Locale.text(userdata.settings.locale, "TUTORIAL_TITLE_4")}`)
                .setColor(`#AEC6CF`)
                .setDescription(Locale.text(userdata.settings.locale, "TUTORIAL_DESC_4"))
                .setImage(`https://cdn.discordapp.com/attachments/822280580577361941/870743311021916190/unknown.png`),
            new EmbedBuilder()
                .setTitle(`${Locale.text(userdata.settings.locale, "TUTORIAL")}: ${Locale.text(userdata.settings.locale, "TUTORIAL_TITLE_5")}`)
                .setColor(`#C3B1E1`)
                .setDescription(Locale.text(userdata.settings.locale, "TUTORIAL_DESC_5"))
                .setImage(`https://cdn.discordapp.com/attachments/822280580577361941/870744481144643614/unknown.png`),
            new EmbedBuilder()
                .setTitle(`${Locale.text(userdata.settings.locale, "TUTORIAL")}: ${Locale.text(userdata.settings.locale, "TUTORIAL_TITLE_6")}`)
                .setColor(`#99A8D1`)
                .setDescription(Locale.text(userdata.settings.locale, "TUTORIAL_DESC_6"))
                .setImage(`https://cdn.discordapp.com/attachments/822280580577361941/870744715094523934/unknown.png`),
            new EmbedBuilder()
                .setTitle(`${Locale.text(userdata.settings.locale, "TUTORIAL")}: ${Locale.text(userdata.settings.locale, "TUTORIAL_TITLE_7")}`)
                .setColor(`#A9A9A9`)
                .setDescription(Locale.text(userdata.settings.locale, "TUTORIAL_DESC_7"))
                .setImage(`https://cdn.discordapp.com/attachments/822280580577361941/870749918661337188/unknown.png`)
        ];
        let page = 0;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('back')
                .setLabel('Back')
                .setStyle('PRIMARY'),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle('PRIMARY')
        );

        let msg = await interaction.reply({embeds:[embeds[page].setFooter({text: `${Locale.text(userdata.settings.locale, "PAGE")}: ${page + 1}/${embeds.length}`})], components: [row], fetchReply: true});

        const member = interaction.member;
        const collector = msg.createMessageComponentCollector({idle: 300000});

        collector.on('collect', async (interaction) => {
            if(!interaction) return;
            if(interaction?.user.id !== member.user.id) return interaction?.reply({content: Locale.text(userdata.settings.locale, "NOT_FOR_YOU"), ephemeral: true})
            if(interaction?.customId == 'back'){
                page -= 1;
                if(page < 0) page = embeds.length - 1;
            };
            if(interaction?.customId == 'next'){
                page += 1;
                if(page >= embeds.length) page = 0;
            };
            await interaction?.update({embeds:[embeds[page].setFooter({text: `${Locale.text(userdata.settings.locale, "PAGE")}: ${page + 1}/${embeds.length}`})]});
        });

        collector.on('stop', async () => {
            if(msg.editable) await msg.edit({embeds:[embeds[page].setFooter({text: `${Locale.text(userdata.settings.locale, "PAGE")}: ${page + 1}/${embeds.length} | ${Locale.text(userdata.settings.locale, "EXPIRED")}`})], components: []});
        });
    }
};