import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption } from "discord.js";
import Config from "../classes/config.js";
import Locale from "../classes/locale.js";

class BlacklistInteraction extends DefaultInteraction {
    static name = "blacklist";
    static guilds = [...Config.HOME_SERVERS];
    static applicationCommand = new SlashCommandBuilder()
        .setDefaultMemberPermissions("0")
        .setName(BlacklistInteraction.name)
        .setDescription("Manage blacklisting users.")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("check")
                .setDescription("Check the blacklist status of a user.")
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName("user")
                        .setDescription("The user to check.")
                        .setRequired(true)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("add")
                .setDescription("Add a user to the blacklist.")
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName("user")
                        .setDescription("The user to add.")
                        .setRequired(true)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("remove")
                .setDescription("Remove a user from the blacklist.")
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName("user")
                        .setDescription("The user to remove.")
                        .setRequired(true)
                )
        )

    constructor() {
        super(BlacklistInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        if (!Config.ADMINS.includes(interaction.user.id))
            return {ephemeral: true, content: Locale.text(interaction, "NO_PERMISSION")};
        
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");
        const isBlacklisted = await interaction.client.storage.isBlacklisted(user.id);
        if (subcommand == "check") {
            if (isBlacklisted) {
                return { ephemeral: true, content: `**${user.username}** is currently blacklisted.` };
            } else {
                return { ephemeral: true, content: `**${user.username}** is not currently blacklisted.` };
            }
        } else if (subcommand == "add") {
            if (isBlacklisted) {
                return { ephemeral: true, content: `**${user.username}** is already blacklisted!` };
            } else {
                await interaction.client.storage.addBlacklisted(user.id);
                return { ephemeral: true, content: `Added **${user.username}** to the bot blacklist.` };
            }
        } else if (subcommand == "remove") {
            if (!isBlacklisted) {
                return { ephemeral: true, content: `**${user.username}** is not already blacklisted!` };
            } else {
                await interaction.client.storage.removeBlacklisted(user.id);
                return { ephemeral: true, content: `Removed **${user.username}** from the bot blacklist.` };
            }
        }
    }
}

export default BlacklistInteraction;