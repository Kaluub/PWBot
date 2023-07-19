import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Utils from "../classes/utils.js";
import Config from "../classes/config.js";

class AppealInteraction extends DefaultInteraction {
    static name = "appeal";

    constructor() {
        super(AppealInteraction.name, [InteractionType.MessageComponent, InteractionType.ModalSubmit]);
    }

    async execute(interaction) {
        const args = interaction.customId.split("/");
        if (interaction.isMessageComponent()) {
            if (args[1] == "reply") {
                const modal = new ModalBuilder()
                    .setCustomId(`appeal/reply/${args[2] ?? interaction.message.id}`)
                    .setTitle("Send reply")
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                    .setCustomId("content")
                                    .setLabel("Reply content:")
                                    .setPlaceholder("Type in your reply here.")
                                    .setStyle(TextInputStyle.Paragraph)
                            )
                    )
            
                return await interaction.showModal(modal);
            } else if (args[1] == "state") {
                // Update the state.
                const appeal = await interaction.client.storage.setAppealState(interaction.message.id, args[2]);
                await interaction.client.storage.createAppealReply(appeal.appeal_id, interaction.user.id, `Marked as ${args[2].replace("_", " ")}`, "status");
                const appealReplyRows = await interaction.client.storage.getAppealReplies(appeal.appeal_id);

                const [actionBarOne, actionBarTwo, embed] = Utils.createAppealMessage(
                    interaction.client,
                    appeal.created_at,
                    appeal.author_id,
                    appeal.content,
                    appeal.appeal_state,
                    appealReplyRows
                );

                await interaction.update({
                    embeds: [embed],
                    components: [actionBarOne, actionBarTwo]
                });
                return await interaction.followUp({ephemeral: true, content: "Updated the state."});
            } else if (args[1] == "unban") {
                // Quick unban the user.
                const appeal = await interaction.client.storage.setAppealState(interaction.message.id, "closed");

                try {
                    const guild = interaction.client.guilds.cache.get("399918427256520705");
                    await guild.members.unban(appeal.author_id);
                } catch {
                    await interaction.client.storage.setAppealState(interaction.message.id, "open");
                    return {ephemeral: true, content: "Could not unban the user."};
                }

                await interaction.client.storage.createAppealReply(appeal.appeal_id, interaction.user.id, `Marked as closed & unbanned`, "status");
                const appealReplyRows = await interaction.client.storage.getAppealReplies(appeal.appeal_id);

                const [actionBarOne, actionBarTwo, embed] = Utils.createAppealMessage(
                    interaction.client,
                    appeal.created_at,
                    appeal.author_id,
                    appeal.content,
                    appeal.appeal_state,
                    appealReplyRows
                );

                await interaction.update({
                    embeds: [embed],
                    components: [actionBarOne, actionBarTwo]
                });
                return await interaction.followUp({ephemeral: true, content: "Unbanned the user and marked the appeal as closed."});
            } else if (args[1] == "block") {
                // Quick block the user.
                const appeal = await interaction.client.storage.setAppealState(interaction.message.id, "closed");

                const isBlacklisted = await interaction.client.storage.isBlacklisted(appeal.author_id);
                if (!isBlacklisted) {
                    await interaction.client.storage.addBlacklisted(appeal.author_id);
                }

                await interaction.client.storage.createAppealReply(appeal.appeal_id, interaction.user.id, `Marked as closed & prevented user from using the bot`, "status");
                const appealReplyRows = await interaction.client.storage.getAppealReplies(appeal.appeal_id);

                const [actionBarOne, actionBarTwo, embed] = Utils.createAppealMessage(
                    interaction.client,
                    appeal.created_at,
                    appeal.author_id,
                    appeal.content,
                    appeal.appeal_state,
                    appealReplyRows
                );

                await interaction.update({
                    embeds: [embed],
                    components: [actionBarOne, actionBarTwo]
                });
                return await interaction.followUp({ephemeral: true, content: "Blocked the user and marked the appeal as closed."});
            }

        } else if (interaction.isModalSubmit()) {
            if (args[1] == "reply") {
                const content = interaction.fields.getTextInputValue("content");

                const appeal = await interaction.client.storage.getAppeal(args[2]);
                const user = await interaction.client.users.fetch(appeal.author_id);

                if (appeal.appeal_state == "closed") {
                    if (user.id === interaction.user.id)
                        return { ephemeral: true, content: "This appeal is already closed. Please create a new one if you need further assistance." };
                    else
                        return { ephemeral: true, content: "Please re-open the appeal to send a reply." };
                }

                if (user.id !== interaction.user.id) {
                    try {
                        const embed = new EmbedBuilder()
                            .setTitle("Reply from staff:")
                            .setColor("#00AAAA")
                            .setTimestamp()
                            .setDescription(
                                `Original message:\n` +
                                appeal.content +
                                `\n\nStaff reply:\n` +
                                content
                            )
                        
                        const actionBar = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`appeal/reply/${args[2]}`)
                                    .setLabel("Reply")
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(appeal.appeal_state != "allow_replies")
                            )
                        
                        await user.send({
                            embeds: [embed],
                            components: [actionBar]
                        });
                    } catch {
                        return { ephemeral: true, content: "Could not send a message to the user. They might have left the server, aren't accepting DMs, or blocked the bot." };
                    }
                }

                await interaction.client.storage.createAppealReply(appeal.appeal_id, interaction.user.id, content, "reply");
                const appealReplyRows = await interaction.client.storage.getAppealReplies(appeal.appeal_id);

                const [actionBarOne, actionBarTwo, embed] = Utils.createAppealMessage(
                    interaction.client,
                    appeal.created_at,
                    appeal.author_id,
                    appeal.content,
                    appeal.appeal_state,
                    appealReplyRows
                );

                const channel = interaction.client.channels.cache.get(Config.APPEAL_CHANNEL);
                const message = await channel.messages.fetch(appeal.message_id);

                await message.edit({
                    embeds: [embed],
                    components: [actionBarOne, actionBarTwo]
                });

                return await interaction.reply({ephemeral: true, content: "Sent your reply."});
            }
        }
    }
}

export default AppealInteraction;