import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import { AppealData } from "../classes/data.js";

const AppealStatusValue = [
    "🟢 [OPEN]",
    "🟡 [UNDER REVIEW]",
    "🔴 [CLOSED]"
];

const maxCount = 15;

export const data = {
    name: "appeals",
    noGuild: true,
    admin: true,
    desc: "Get appeals matching certain criteria",
    usage: "/appeals",
    options: [{
        "name": "id",
        "description": "Filter by the user ID of whoever created the appeal",
        "type": ApplicationCommandOptionType.String,
        "required": false
    },
    {
        "name": "status",
        "description": "Filter by the status of the appeal",
        "type": ApplicationCommandOptionType.Integer,
        "required": false,
        "choices": [
            {
                "name": "Open",
                "value": 0
            },
            {
                "name": "In progress",
                "value": 1
            },
            {
                "name": "Closed",
                "value": 2
            }
        ]
    }],
    execute: async ({ interaction }) => {
        const appeals = await AppealData.filter(
            interaction.options?.getString("id", false) ?? undefined,
            interaction.options?.getInteger("status", false) ?? undefined
        );
        const count = await appeals.count();
        appeals.limit(maxCount);

        const embed = new EmbedBuilder()
            .setColor('#882244')
            .setTitle('Appeals:')
            .setDescription(`Here's ${count > maxCount ? `${maxCount}/${count}` : count} appeals matching that criteria:\n`)
            .setTimestamp();

        let appealsAdded = 0
        await appeals.forEach(function(appeal) {
            appealsAdded++;
            const user = interaction.client.users.cache.get(appeal.authorId);
            embed.setDescription(embed.data.description + `\n${AppealStatusValue[appeal.status]} Created by ${user ? user.tag : appeal.authorId}: ${appeal.messages[0]?.url ?? "URL unavailable"} (<t:${Math.floor(appeal.createdAt / 1000)}>, <t:${Math.floor(appeal.createdAt / 1000)}:R>)`);
        });

        if (!appealsAdded) embed.setDescription("No appeals matching that criteria.");

        return {embeds:[embed]};
    }
};