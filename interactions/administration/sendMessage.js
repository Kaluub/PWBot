import DefaultInteraction from "../../classes/defaultInteraction.js";
import { ActionRowBuilder, ButtonBuilder, InteractionType, ModalBuilder, SlashCommandBuilder, SlashCommandChannelOption, TextInputBuilder, TextInputStyle } from "discord.js";
import config from "../../classes/config.js";
import Locale from "../../classes/locale.js";

class SendInteraction extends DefaultInteraction {
    static name = "send";
    static guilds = [...config.home_servers];
    static applicationCommand = new SlashCommandBuilder()
        .setName(SendInteraction.name)
        .setDescription("Send a message through the bot.")
        .addChannelOption(
            new SlashCommandChannelOption()
                .setName("channel")
                .setDescription("The channel to send to. If omitted, uses the current channel.")
                .setRequired(false)
        )

    constructor() {
        super(SendInteraction.name, [InteractionType.ApplicationCommand, InteractionType.ModalSubmit]);
    }

    async execute(interaction) {
        if (!config.admins.includes(interaction.user.id)) {
            return {ephemeral: true, content: Locale.text(interaction, "NO_PERMISSION")};
        }

        if (interaction.isChatInputCommand()) {
            const channel = interaction.options.getChannel("channel", false) ??
                await interaction.client.channels.fetch(interaction.channelId);
            
            if (!channel.isTextBased()) {
                return {ephemeral: true, content: Locale.text(interaction, "NOT_TEXT_CHANNEL")};
            }

            const modal = new ModalBuilder()
                .setCustomId("send/" + channel.id)
                .setTitle("Send message")
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("content")
                                .setLabel("Message content:")
                                .setMaxLength(2000)
                                .setStyle(TextInputStyle.Paragraph)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("reply")
                                .setLabel("Reply to:")
                                .setPlaceholder("Message ID here. Optional.")
                                .setMaxLength(25)
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("buttons")
                                .setLabel("Buttons:")
                                .setPlaceholder("Don't use this if you don't know what you are doing. Format: id,label,style/id,label,style")
                                .setMaxLength(100)
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                        )
                )
            
            return await interaction.showModal(modal);
        } else if (interaction.isModalSubmit()) {
            const channelId = interaction.customId.split("/")[1];
            const channel = await interaction.client.channels.fetch(channelId);
            const content = interaction.fields.getTextInputValue("content");
            const reply = interaction.fields.getTextInputValue("reply") ?? undefined;
            const buttons = interaction.fields.getTextInputValue("buttons") ?? undefined;
            
            let options = { content };
            if (reply) {
                options.reply = { messageReference: reply, failIfNotExists: false };
            }
            if (buttons) {
                const actionRow = new ActionRowBuilder();
                const buttonArray = buttons.split("/");
                let i = 0;
                for (const buttonSegment of buttonArray) {
                    i += 1;
                    if (i >= 5)
                        break;
                    
                    const [id, label, style] = buttonSegment.split(",");
                    actionRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(id)
                            .setLabel(label)
                            .setStyle(parseInt(style))
                    );
                }
                options.components = [actionRow];
            }

            try {
                const message = await channel.send(options);
                return {ephemeral: true, content: Locale.text(interaction, "SENT_MESSAGE", [message.url])};
            } catch {
                return {ephemeral: true, content: Locale.text(interaction, "FAILED_SENDING_MESSAGE")};
            }
        }
    }
}

export default SendInteraction;