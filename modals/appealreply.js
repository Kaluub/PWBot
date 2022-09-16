import Locale from "../classes/locale.js";
import { MessageEmbed } from "discord.js";
import { UserData, AppealData } from "../classes/data.js";

export const data = {
    name: "appealreply",
    execute: async ({interaction, userdata, args}) => {
        const content = interaction.fields.getTextInputValue("content");
        const user = await interaction.client.users.fetch(args[0]);
        const channel1 = interaction.client.channels.cache.get(interaction.client.config.modMailChannel);
        const channel2 = interaction.client.channels.cache.get(interaction.client.config.modMailReplyChannel);
        const message = await channel1.messages.fetch(args[1]);

        const appealReplyEmbed = new MessageEmbed()
            .setDescription(`Message from staff:`)
            .addField("Message:", content)
            .setColor("#00AAAA")
        
        const appealReplyStaffEmbed = new MessageEmbed()
            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
            .setDescription(`Staff reply from ${interaction.user} to [${user.tag}](${message.url}):`)
            .addField("Message:", content)
            .setColor("#AA0000")
        
        try {
            await user.send({embeds: [appealReplyEmbed]});
            const msg = await channel2.send({embeds: [appealReplyStaffEmbed]});
            const appeal = await AppealData.get(message.id);
            appeal.addMessage(content, interaction.user.id, msg.url);
            await AppealData.set(message.id, appeal)
        } catch {
            return {content: "Reply failed, user likely did not accept replies from the bot or left the server.", ephemeral: true};
        };

        return {content: Locale.text(userdata.settings.locale, "MODMAIL_SUCCESS"), ephemeral: true};
    }
};