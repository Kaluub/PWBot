import { EmbedBuilder, ButtonBuilder, ActionRowBuilder } from "discord.js";
import { readJSON } from "../json.js";
import Locale from "../classes/locale.js";
import { UserData } from "../classes/data.js";

export const data = {
    name:'vanity',
    desc:`Manage your vanity roles.`,
    usage:'/vanity',
    execute: async ({interaction}) => {
        const guild = interaction.guild;
        const member = interaction.member;
        await member.fetch();

        let userdata = await UserData.get(member.id)
        const roles = readJSON('json/vanityroles.json');
        member.roles.cache.each(role => {
            if(roles.includes(role.id) && !userdata.unlocked.roles.includes(role.id)) userdata.unlocked.roles.push(role.id);
        });
        await UserData.set(member.user.id, userdata);
        if(userdata.unlocked.roles.length < 1) return Locale.text(userdata.settings.locale, "NO_VANITY_ROLES");

        let desc = Locale.text(userdata.settings.locale, "VANITY_DESC");
        for(const id of userdata.unlocked.roles){
            const role = await guild.roles.fetch(id);
            desc += `\n${member.roles.cache.has(id) ? `🟢` : `🔴`} ${role.name}`;
        };

        let embed = new EmbedBuilder()
            .setTitle(Locale.text(userdata.settings.locale, "VANITY_TITLE"))
            .setDescription(desc)
            .setColor(`#228866`)
            .setTimestamp()
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('up')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_UP"))
                .setStyle('SECONDARY'),
            new ButtonBuilder()
                .setCustomId('select')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_SELECT"))
                .setStyle('SUCCESS'),
            new ButtonBuilder()
                .setCustomId('down')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_DOWN"))
                .setStyle('SECONDARY'),
            new ButtonBuilder()
                .setCustomId('clean')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_CLEAN"))
                .setStyle('DANGER')
        );

        let sel = 0;
        let descArr = embed.data.description.replace('➡️ ', '').split('\n');
        descArr[sel + 3] = "➡️ " + descArr[sel + 3];
        let msg = await interaction.reply({embeds:[embed.setDescription(descArr.join('\n'))], components: [row], fetchReply: true});

        const collector = msg.createMessageComponentCollector({idle:30000});
        collector.on('collect', async (interaction) => {
            if(interaction.user.id !== member.user.id) return interaction.reply({content: Locale.text(userdata.settings.locale, "NOT_FOR_YOU"), ephemeral: true});
            if(interaction.customId == 'up'){
                sel -= 1;
                if(sel < 0) sel = embed.data.description.split('\n').length - 4;
            };

            if(interaction.customId == 'down'){
                sel += 1;
                if(sel >= embed.data.description.split('\n').length - 3) sel = 0;
            };

            if(interaction.customId == 'select'){
                // Toggle role:
                const id = userdata.unlocked.roles[sel];
                if(member.roles.cache.has(id)) await member.roles.remove(id, 'Role toggled.');
                else await member.roles.add(id, 'Role toggled.');
                member = await member.fetch(true);

                // Update desc:
                desc = Locale.text(userdata.settings.locale, "VANITY_DESC");
                for(const rid of userdata.unlocked.roles){
                    const role = await guild.roles.fetch(rid);
                    desc += `\n${member.roles.cache.has(rid) ? `🟢` : `🔴`} ${role.name}`;
                };
                embed.setDescription(desc);
            };

            if(interaction.customId == 'clean') {
                const roles = [];
                for(const rid of userdata.unlocked.roles){
                    roles.push(rid);
                };
                await member.roles.remove(roles, 'Roles cleaned.');
                embed.setDescription(desc.replaceAll(`🟢`, `🔴`));
            };

            descArr = embed.data.description.replaceAll('➡️ ', '').split('\n');
            descArr[sel + 3] = "➡️ " + descArr[sel + 3];
            await interaction.update({embeds:[embed.setDescription(descArr.join('\n'))]});
        });
        collector.on('end', async () => {
            if(msg.editable) await msg.edit({embeds:[embed], components: []});
        });
    }
};