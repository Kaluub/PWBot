import { EmbedBuilder } from "discord.js";
import StatusLogger from "../../classes/statusLogger.js";

export const data = {
    name: 'logs/status',
    execute: async ({ interaction }) => {
        const filteredLogs = StatusLogger.filterLogs({
            timestamp: interaction.options?.getString("timestamp", false),
            type: interaction.options?.getString("type", false)
        });

        if(!filteredLogs.length) return `There are no entries with your current filter!`;

        const shortenedLogs = filteredLogs.slice(-15);

        const embed = new EmbedBuilder()
            .setColor('#4499DD')
            .setTitle('Logs:')
            .setDescription(`Last ${shortenedLogs.length} ${shortenedLogs.length > 1 ? 'entries' : 'entry'} out of ${filteredLogs.length.toLocaleString()} with your current filter:`)
            .setTimestamp();

        for(const log of shortenedLogs) {
            embed.setDescription(embed.data.description + `\n\n${log.type}: ${log.detail} (<t:${Math.floor(log.timestamp / 1000)}>, <t:${Math.floor(log.timestamp / 1000)}:R>)`);
        };

        return {embeds:[embed]};
    }
};