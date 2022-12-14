import { ActionRowBuilder, ButtonBuilder } from "discord.js";

export const data = {
    name: 'messages/send',
    execute: async ({interaction}) => {
        let channel = await interaction.client.channels.fetch(interaction.options.getString('id'));
        if(!channel) channel = await interaction.client.users.fetch(interaction.options.getString('id'));
        if(!channel) return 'There was no match for this channel or user ID.';
        
        const ephemeral = interaction.options.getBoolean('hide-response') ?? false;

        const content = interaction.options.getString('content', false).replaceAll("\\n", "\n");
        const reply = interaction.options.getString('reply', false) ?? undefined;
        const tts = interaction.options.getBoolean('tts', false) ?? undefined;
        const linkData = interaction.options.getString('links', false);
        const button = interaction.options.getString('button', false);
        const row = new ActionRowBuilder();
        if(button) {
            const bData = JSON.parse(button);
            row.addComponents(new ButtonBuilder(bData));
        };
        if(linkData) {
            const links = linkData.split(';');
            if(links.length > 5 || links.length < 1) return {content: 'Syntax error: Between 1 to 5 links must be included, if any.', ephemeral};
            for (const i of links) {
                const data = i.split(',');
                if (data.length !== 2) return {content: "Syntax error: Please use the 'title,url;title2,url2' format.", ephemeral};
                row.addComponents(
                    new ButtonBuilder()
                        .setStyle("LINK")
                        .setLabel(data[0])
                        .setURL(data[1])
                );
            };
        };
        if(row.components.length > 5) row.components = row.components.slice(0, 5);

        let send = {content};
        if(row.components.length) send.components = [row];
        if(reply) send.reply = {messageReference: reply, failIfNotExists: false};
        if(tts) send.tts = tts;
        
        try{
            await channel.send(send);
        } catch(err) {
            return {content: `Couldn't send a message to this channel/user.\n\nDetail:\n\`\`\`${err}\`\`\``, ephemeral};
        };
        
        return {content: `Sent a message to ${channel}.`, ephemeral};
    }
};