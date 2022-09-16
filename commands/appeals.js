import { MessageEmbed } from "discord.js";
import { AppealData, AppealStatus } from "../classes/data.js";

const AppealStatusValue = [
    "OPEN",
    "UNDER REVIEW",
    "CLOSED"
]

export const data = {
    name: "appeals",
    noGuild: true,
    admin: true,
    desc: "Get appeals matching certain criteria",
    usage: "/appeals",
    options: [{
        "name": "id",
        "description": "Filter by the user ID of whoever created the appeal",
        "type": "STRING",
        "required": false
    },
    {
        "name": "status",
        "description": "Filter by the status of the appeal",
        "type": "INTEGER",
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
            interaction.options?.getInteger("status", false) ?? AppealStatus.OPEN,
            interaction.options?.getString("authorId", false) ?? undefined
        )
        appeals.limit(15);

        const embed = new MessageEmbed()
            .setColor('#882244')
            .setTitle('Appeals:')
            .setDescription("Here's some appeals matching that criteria:\n")
            .setTimestamp();

        await appeals.forEach(function(appeal) {
            embed.setDescription(embed.description + `\n[${AppealStatusValue[appeal.status]}] Created by ${appeal.authorId}: ${appeal.messages[0]?.url ?? "URL unavailable"} (<t:${Math.floor(appeal.createdAt / 1000)}>, <t:${Math.floor(appeal.createdAt / 1000)}:R>)`);
        });

        return {embeds:[embed]};
    }
};