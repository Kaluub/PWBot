import Locale from "../classes/locale.js"
import { readJSON } from "../json.js";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";

export const data = {
    name: 'list',
    aliases: ['l'],
    admin: false,
    desc: `This is a command for viewing your owned backgrounds and frames.`,
    usage: '/list',
    disabled: true,
    execute: async ({interaction, userdata}) => {
        const member = interaction.member;
        let rewards = await readJSON('json/rewards.json');

        const embed = new EmbedBuilder()
            .setColor('#33AA33')
            .setTitle(Locale.text(userdata.settings.locale, "LIST_TITLE"))
            .setDescription(Locale.text(userdata.settings.locale, "LIST_DESC"))
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('backgrounds')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_BACKGROUNDS"))
                .setStyle('SECONDARY'),
            new ButtonBuilder()
                .setCustomId('frames')
                .setLabel(Locale.text(userdata.settings.locale, "BUTTON_FRAMES"))
                .setStyle('SECONDARY')
        );
        
        const msg = await interaction.reply({embeds: [embed], components: [row], fetchReply: true});

        let collector = msg.createMessageComponentCollector({idle: 30000});
    
        collector.on('collect', async int => {
            if(int.user.id !== member.id) return await int.reply({content: Locale.text(userdata.settings.locale, "NOT_FOR_YOU"), ephemeral: true});

            if(int.customId == 'backgrounds'){ // Backgrounds:
                embed.setDescription(Locale.text(userdata.settings.locale, "LIST_BACKGROUNDS"));
                for(const id of userdata.unlocked.backgrounds){
                    const background = rewards[id];
                    embed.setDescription(embed.data.description + Locale.text(userdata.settings.locale, "LIST_REWARD", background.name));
                };
            };

            if(int.customId == 'frames'){ // Frames:
                embed.setDescription(Locale.text(userdata.settings.locale, "LIST_FRAMES"));
                for(const id of userdata.unlocked.frames){
                    const frame = rewards[id];
                    embed.setDescription(embed.data.description + Locale.text(userdata.settings.locale, "LIST_REWARD", frame.name));
                };
            };

            embed.setDescription(embed.data.description + Locale.text(userdata.settings.locale, "LIST_CONCLUSION"));
            embed.setTimestamp(Date.now() + 30000);
            await int.update({embeds:[embed]});
        });
        collector.on('end', async () => {
            const footer = Locale.text(userdata.settings.locale, "EXPIRED");
            embed.setFooter({text: footer});
            if(msg.editable) await msg.edit({embeds:[embed], components:[]});
        });
    }
};