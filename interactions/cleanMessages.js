import DefaultInteraction from "../classes/defaultInteraction.js";
import { ApplicationCommandType, ContextMenuCommandBuilder, InteractionType } from "discord.js";
import Locale from "../classes/locale.js";
import Config from "../classes/config.js";

class CleanMessagesInteraction extends DefaultInteraction {
    static name = "Clean messages to here";
    static guilds = [...Config.HOME_SERVERS];
    static applicationCommand = new ContextMenuCommandBuilder()
        .setDefaultMemberPermissions("0")
        .setName(CleanMessagesInteraction.name)
        .setType(ApplicationCommandType.Message)

    constructor() {
        super(CleanMessagesInteraction.name, [InteractionType.ApplicationCommand]);
        this.defer = true;
        this.ephemeral = true;
    }

    async execute(interaction) {
        if (!Config.ADMINS.includes(interaction.user.id))
            return {ephemeral: true, content: Locale.text(interaction, "NO_PERMISSION")};
        try {
            const channel = await interaction.client.channels.fetch(interaction.channelId);
            const messages = await channel.messages.fetch({after: interaction.targetMessage.id, limit: 100});
            messages.set(interaction.targetMessage.id, interaction.targetMessage);
            await channel.bulkDelete(messages);
            return {ephemeral: true, content: Locale.text(interaction, "DELETED_X_MESSAGES", [messages.size])};
        } catch {
            return {ephemeral: true, content: Locale.text(interaction, "FAILED_BULK_DELETE")};
        }
    }
}

export default CleanMessagesInteraction;