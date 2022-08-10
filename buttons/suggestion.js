import { GuildData } from "../classes/data.js";

export const data = {
    name: "suggestion",
    execute: async ({interaction}) => {
        const data = await GuildData.get(interaction.guildId);
        if(!data.suggestions[interaction.message.id]) return await interaction.reply({content: `This suggestion is broken! Sorry for the inconvenience.`, ephemeral: true})
        if(data.suggestions[interaction.message.id].voters.includes(interaction.user.id)) return await interaction.reply({content: `You've already voted for this suggestion.`, ephemeral: true});
        const type = interaction.customId.split('-')[1];
        data.suggestions[interaction.message.id][type] += 1;
        data.suggestions[interaction.message.id].voters.push(interaction.user.id);
        await GuildData.set(interaction.guildId, data);
        await updateSuggestion(data.suggestions[interaction.message.id], interaction.message);
        await interaction.reply({content: 'Successfully voted!', ephemeral: true});
    }
};