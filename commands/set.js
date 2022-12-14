import { UserData } from "../classes/data.js";
import Locale from "../classes/locale.js";
import { readJSON } from "../json.js";
import { createProfileCard } from "../functions.js";
import { ActionRowBuilder, SelectMenuBuilder, AttachmentBuilder } from "discord.js";

export const data = {
    name: 'set',
    aliases: ['s', 'custom', 'c'],
    desc: 'This is a command for customizing your profile card.',
    usage: '/set',
    disabled: true,
    execute: async ({interaction}) => {
        await interaction.deferReply();
        const guild = interaction.guild;
        const member = interaction.member;

        const rewards = await readJSON('json/rewards.json');
        let userdata = await UserData.get(member.user.id);

        const backgroundMenu = new SelectMenuBuilder().setCustomId('set-background').setPlaceholder(Locale.text(userdata.settings.locale, "SET_BACKGROUND"));
        await userdata.unlocked.backgrounds.forEach(async id => {
            const bg = rewards[id];
            backgroundMenu.addOptions({label: bg.name, value: bg.id, description: bg.desc.slice(0, 99)});
        });

        const frameMenu = new SelectMenuBuilder().setCustomId('set-frame').setPlaceholder(Locale.text(userdata.settings.locale, "SET_FRAME"));
        await userdata.unlocked.frames.forEach(async id => {
            const fr = rewards[id];
            frameMenu.addOptions({label: fr.name, value: fr.id, description: fr.desc.slice(0, 99)});
        });

        const row1 = new ActionRowBuilder().setComponents(backgroundMenu);
        const row2 = new ActionRowBuilder().setComponents(frameMenu);

        const buffer = await createProfileCard(member, rewards, userdata);
        const att = new AttachmentBuilder().setFile(buffer).setName('card.png');

        const msg = await interaction.editReply({content: Locale.text(userdata.settings.locale, "SET_DESC"), files: [att], components: [row1, row2], fetchReply: true});

        const collector = msg.createMessageComponentCollector({idle: 120000});
        
        collector.on('collect', async int => {
            if(!interaction.client.config.admins.includes(int.user.id) && int.user.id !== member.user.id) return await int.reply({content: Locale.text(userdata.settings.locale, "NOT_FOR_YOU"), ephemeral: true});
            
            await int.deferUpdate();

            if(int.customId == 'set-background') {
                if(userdata.card.background != "smile_background") {
                    userdata.card.background = int.values[0];
                    userdata = await UserData.set(member.user.id, userdata);
                };
            };

            if(int.customId == 'set-frame') {
                userdata.card.frame = int.values[0];
                userdata = await UserData.set(member.user.id, userdata);
            };

            await msg.removeAttachments();
            const newbuffer = await createProfileCard(member, rewards, userdata);
            const newatt = new AttachmentBuilder().setFile(newbuffer).setName('card.png');
            return await int.editReply({files: [newatt]});
        });

        collector.on('end', async () => {
            if(msg.editable) await msg.edit({content: `~~${msg.content}~~`, components: []});
        });
    }
};