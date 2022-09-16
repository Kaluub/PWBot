import Locale from "../classes/locale.js";
import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import { UserData, AppealData } from "../classes/data.js";

export const data = {
    name: "appeal",
    execute: async ({interaction, userdata}) => {

        const category = interaction.fields.getTextInputValue("category");
        const content = interaction.fields.getTextInputValue("content");

        const appealEmbed = new MessageEmbed()
            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
            .setDescription(`Message from ${interaction.user}:`)
            .addField("Category:", category)
            .addField("Message:", content)
            .setColor("#AAAA00")
            .setTimestamp()
        
        const channel = interaction.client.channels.cache.get(interaction.client.config.modMailChannel);
        const message = await channel.send({embeds: [appealEmbed]});
        
        const replyButton = new MessageButton()
            .setCustomId(`appealreply/${interaction.user.id}`)
            .setLabel("Reply")
            .setStyle("PRIMARY")
        
        const quickUnbanButton = new MessageButton()
            .setCustomId(`appealunban/${message.id}`)
            .setLabel("Unban")
            .setStyle("SUCCESS")
        
        const quickCloseButton = new MessageButton()
            .setCustomId(`appealclose/${message.id}`)
            .setLabel("Close")
            .setStyle("DANGER")
        
        const quickActionBar = new MessageActionRow()
            .addComponents(replyButton, quickUnbanButton, quickCloseButton)
        
        await message.edit({components: [quickActionBar]})

        await AppealData.set(message.id, new AppealData({authorId: interaction.user.id}).addMessage(content, interaction.user.id, message.url))

        return {content: Locale.text(userdata.settings.locale, "MODMAIL_SUCCESS"), ephemeral: true};
    }
};