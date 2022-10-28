import Locale from "../classes/locale.js";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import { AppealData, AppealMessageType, AppealStatus } from "../classes/data.js";
import { createAppealEmbed } from "../functions.js";

export const data = {
    name: "appealreply",
    execute: async ({interaction, userdata, args}) => {
        const content = interaction.fields.getTextInputValue("content");
        const user = await interaction.client.users.fetch(args[0]);
        const channel1 = interaction.client.channels.cache.get(interaction.client.config.modMailChannel);
        const channel2 = interaction.client.channels.cache.get(interaction.client.config.modMailReplyChannel);
        const message = await channel1.messages.fetch(args[1]);
        let appeal = await AppealData.get(message.id);

        const appealReplyEmbed = new EmbedBuilder()
            .setDescription(`Message from staff:`)
            .addFields({name: "Message:", value: content})
            .setColor("#00AAAA")
        
        const appealDmReplyButton = new ButtonBuilder()
            .setCustomId("appealdmreply/" + message.id)
            .setStyle("PRIMARY")
            .setLabel("Reply")
        
        const appealDmActions = new ActionRowBuilder()
            .addComponents(appealDmReplyButton)
        
        const appealReplyStaffEmbed = new EmbedBuilder()
            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
            .setDescription(`Staff reply from ${interaction.user} to [${user.tag}](${message.url}):`)
            .addFields({name: "Message:", value: content})
            .setColor("#AA0000")
        
        try {
            const showDmActionRow = appeal.status == AppealStatus.IN_PROGRESS;
            let userMessageData = {embeds: [appealReplyEmbed]};
            if (showDmActionRow) userMessageData.components = [appealDmActions];
            await user.send(userMessageData);
            const msg = await channel2.send({embeds: [appealReplyStaffEmbed]});
            if (appeal.status == AppealStatus.CLOSED) appeal.status = AppealStatus.OPEN;
            appeal.addMessage(content, interaction.user.id, msg.url, AppealMessageType.REPLY);
            await AppealData.set(message.id, appeal);
            await interaction.update({embeds: [createAppealEmbed(appeal, interaction.client)]});
            await interaction.followUp({content: Locale.text(userdata.settings.locale, "MODMAIL_SUCCESS"), ephemeral: true});
        } catch {
            if(interaction.replied) return {content: "Reply failed, user likely did not accept replies from the bot or left the server.", ephemeral: true};
        };
    }
};