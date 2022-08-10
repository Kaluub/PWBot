import Locale from "../classes/locale.js";
import { MessageEmbed } from "discord.js";

export const data = {
    name: "modmail",
    execute: async ({interaction, userdata}) => {
        const category = interaction.fields.getTextInputValue("category");
        const content = interaction.fields.getTextInputValue("content");

        const modmailEmbed = new MessageEmbed()
            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
            .setDescription(`Message from ${interaction.user}:`)
            .addField("Category:", category)
            .addField("Message:", content)
            .setColor("#AAAA00")
        const channel = interaction.client.channels.cache.get(interaction.client.config.modMailChannel);
        await channel.send({embeds: [modmailEmbed]});
        return {content: Locale.text(userdata.settings.locale, "MODMAIL_SUCCESS"), ephemeral: true};
    }
};