import { EmbedBuilder } from "discord.js";
import Locale from "../classes/locale.js";

export const data = {
    name: 'stats',
    noGuild: true,
    desc: 'It is just stats.',
    usage: '/stats',
    execute: async ({interaction, userdata}) => {
        const client = interaction.client;
        const embed = new EmbedBuilder()
            .setTitle(Locale.text(userdata.settings.locale, "STATISTICS"))
            .setColor('#662211')
            .setTimestamp()
            .setDescription(`Uptime: <t:${Math.floor(client.readyTimestamp / 1000)}> (<t:${Math.floor(client.readyTimestamp / 1000)}:R>)\nPerf: ${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB\nCached: ${client.guilds.cache.size} guilds, ${client.channels.cache.size} channels, ${client.users.cache.size} users\nWebSocket ping: ${client.ws.ping} ms`)
        return {embeds: [embed]};
    }
};