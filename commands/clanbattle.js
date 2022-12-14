import { ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, TextInputStyle, ChannelType } from "discord.js";
import { GuildData } from "../classes/data.js";
import Locale from "../classes/locale.js";
import { data as clanbattle } from "../events/clanbattle.js";

export const data = {
    name: 'clanbattle',
    desc: 'Command used to manage clan battles.',
    usage: '/clanbattle [test/start/questions]',
    disabled: true,
    options: [
        {
            "name": "test",
            "description": "Test a clan battle. Includes debug tools.",
            "type": ApplicationCommandOptionType.Subcommand,
            "options": [
                {
                    "name": "channel",
                    "description": "The text channel to use.",
                    "type": ApplicationCommandOptionType.Channel,
                    "channelTypes": [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
                    "required": false
                }
            ]
        },
        {
            "name": "start",
            "description": "Once every hour, you can start a clan battle.",
            "type": ApplicationCommandOptionType.Subcommand,
            "options": [
                {
                    "name": "channel",
                    "description": "The text channel to use.",
                    "type": ApplicationCommandOptionType.Channel,
                    "channelTypes": [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread],
                    "required": false
                }
            ]
        },
        {
            "name": "questions",
            "description": "The questions used in the clan battle.",
            "type": ApplicationCommandOptionType.SubcommandGroup,
            "options": [
                {
                    "name": "add",
                    "description": "Add a new question.",
                    "type": ApplicationCommandOptionType.Subcommand,
                },
                {
                    "name": "remove",
                    "description": "Remove an older question.",
                    "type": ApplicationCommandOptionType.Subcommand
                }
            ]
        }
    ],
    execute: async ({interaction, userdata}) => {
        if(interaction.options.getSubcommand(false) == 'test') {
            if(!interaction.client.config.admins.includes(interaction.user.id) && !userdata.unlocked.features.includes("CLANBATTLE_MANAGER")) return Locale.text(userdata.settings.locale, "PERMISSION_ERROR");
            let channel = interaction.options.getChannel('channel', false);
            if(!channel) channel = interaction.channel;
            await clanbattle.execute({channel: channel, debug: true, ping: false});
            return {content: Locale.text(userdata.settings.locale, "CLANBATTLE_TEST_STARTED", channel)};
        };

        if(interaction.options.getSubcommand(false) == 'start') {
            const data = await GuildData.get(interaction.guild.id);
            if(data.clanBattles.cooldown > Date.now())
                if(!interaction.client.config.admins.includes(interaction.user.id)) return Locale.text(userdata.settings.locale, "CLANBATTLE_COOLDOWN", Math.floor(data.clanBattles.cooldown / 1000));
            data.clanBattles.cooldown = Date.now() + 3600000;
            await GuildData.set(interaction.guild.id, data);
            let channel = interaction.options.getChannel('channel', false);
            if(!channel) channel = interaction.channel;
            await clanbattle.execute({channel: channel, ping: false});
            return {content: Locale.text(userdata.settings.locale, "CLANBATTLE_STARTED", channel)};
        };

        if(interaction.options.getSubcommandGroup(false) == 'questions') {
            if(!interaction.client.config.admins.includes(interaction.user.id) && !userdata.unlocked.features.includes("CLANBATTLE_MANAGER")) return Locale.text(userdata.settings.locale, "PERMISSION_ERROR");
            if(interaction.options.getSubcommand(false) == 'add') {
                const modal = new ModalBuilder()
                    .setCustomId("clanbattle-add-question")
                    .setTitle(Locale.text(userdata.settings.locale, "CLANBATTLE_ADD_QUESTION_MODAL_TITLE"))
                
                const questionInput = new TextInputBuilder()
                    .setCustomId("question-title")
                    .setLabel(Locale.text(userdata.settings.locale, "CLANBATTLE_ADD_QUESTION_MODAL_LABEL_1"))
                    .setPlaceholder(Locale.text(userdata.settings.locale, "CLANBATTLE_ADD_QUESTION_MODAL_PLACEHOLDER_1"))
                    .setMaxLength(128)
                    .setMinLength(4)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                
                const optionsInput = new TextInputBuilder()
                    .setCustomId("question-options")
                    .setLabel(Locale.text(userdata.settings.locale, "CLANBATTLE_ADD_QUESTION_MODAL_LABEL_2"))
                    .setPlaceholder(Locale.text(userdata.settings.locale, "CLANBATTLE_ADD_QUESTION_MODAL_PLACEHOLDER_2"))
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                
                const answerInput = new TextInputBuilder()
                    .setCustomId("question-answer")
                    .setLabel(Locale.text(userdata.settings.locale, "CLANBATTLE_ADD_QUESTION_MODAL_LABEL_3"))
                    .setPlaceholder(Locale.text(userdata.settings.locale, "CLANBATTLE_ADD_QUESTION_MODAL_PLACEHOLDER_3"))
                    .setMaxLength(1)
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                
                modal.addComponents(
                    new ActionRowBuilder().addComponents(questionInput),
                    new ActionRowBuilder().addComponents(optionsInput),
                    new ActionRowBuilder().addComponents(answerInput)
                );

                return await interaction.showModal(modal);
            } else if(interaction.options.getSubcommand(false) == 'remove') {
                return Locale.text(userdata.settings.locale, "TODO");
            } else return Locale.text(userdata.settings.locale, "HOW_DID_WE_GET_HERE");
        };

        return Locale.text(userdata.settings.locale, "HOW_DID_WE_GET_HERE");
    }
};