import { readdirSync } from "fs";
import { ApplicationCommandOptionType } from "discord.js";

const functions = new Map();
const files = readdirSync("./commands/admin").filter(file => file.endsWith('.js'));
files.forEach(async file => {
    const { data } = await import(`./admin/${file}`);
    if(!data.archived) functions.set(data.name, data);
});

export const data = {
    name: 'admin',
    desc: 'All administrative commands are held here.',
    usage: '/admin [...]',
    admin: true,
    options: [
        {
            "name": "points",
            "description": "A command to manage point distribution.",
            "type": ApplicationCommandOptionType.Subcommand,
            "options": [
                {
                    "name": "member",
                    "description": "The member to give the points to.",
                    "type": ApplicationCommandOptionType.User,
                    "required": true
                },
                {
                    "name": "points",
                    "description": "The amount of points to give this member.",
                    "type": ApplicationCommandOptionType.Integer,
                    "required": true
                },
                {
                    "name": "force-set",
                    "description": "Whether the points should be set to the amount or not",
                    "type": ApplicationCommandOptionType.Boolean,
                    "required": false
                }
            ]
        },
        {
            "name": "rewards",
            "description": "Manage the rewards from the shop.",
            "type": ApplicationCommandOptionType.SubcommandGroup,
            "options": [
                {
                    "name": "add",
                    "description": "Add a reward to a user.",
                    "type": ApplicationCommandOptionType.Subcommand,
                    "options": [
                        {
                            "name": "member",
                            "description": "The member to give the reward to.",
                            "type": ApplicationCommandOptionType.User,
                            "required": true
                        },
                        {
                            "name": "reward",
                            "description": "The reward to give the member.",
                            "type": ApplicationCommandOptionType.String,
                            "autocomplete": true,
                            "required": true
                        }
                    ]
                },
                {
                    "name": "remove",
                    "description": "Remove a reward from a user.",
                    "type": ApplicationCommandOptionType.Subcommand,
                    "options": [
                        {
                            "name": "member",
                            "description": "The member to remove the reward from.",
                            "type": ApplicationCommandOptionType.User,
                            "required": true
                        },
                        {
                            "name": "reward",
                            "description": "The reward to remove from the member.",
                            "type": ApplicationCommandOptionType.String,
                            "autocomplete": true,
                            "required": true
                        }
                    ]
                },
                {
                    "name": "create",
                    "description": "Create a new reward.",
                    "type": ApplicationCommandOptionType.Subcommand
                }
            ]
        },
        {
            "name": "features",
            "description": "Manage a users features.",
            "type": ApplicationCommandOptionType.SubcommandGroup,
            "options": [
                {
                    "name": "add",
                    "description": "Add a feature to a user.",
                    "type": ApplicationCommandOptionType.Subcommand,
                    "options": [
                        {
                            "name": "member",
                            "description": "The member to give the feature to.",
                            "type": ApplicationCommandOptionType.User,
                            "required": true
                        },
                        {
                            "name": "feature",
                            "description": "The feature to give the member.",
                            "type": ApplicationCommandOptionType.String,
                            "autocomplete": true,
                            "required": true
                        }
                    ]
                },
                {
                    "name": "remove",
                    "description": "Remove a feature from a user.",
                    "type": ApplicationCommandOptionType.Subcommand,
                    "options": [
                        {
                            "name": "member",
                            "description": "The member to remove the feature from.",
                            "type": ApplicationCommandOptionType.User,
                            "required": true
                        },
                        {
                            "name": "feature",
                            "description": "The feature to remove from the member.",
                            "type": ApplicationCommandOptionType.String,
                            "autocomplete": true,
                            "required": true
                        }
                    ]
                }
            ]
        },
        {
            "name": "modmail",
            "description": "This command is used to change the mod-mail channel.",
            "type": ApplicationCommandOptionType.Subcommand,
            "options": [
                {
                    "name": "channel",
                    "description": "The channel to use the mod-mail feature in.",
                    "type": ApplicationCommandOptionType.Channel,
                    "channelTypes": ["GUILD_TEXT", "GUILD_NEWS"],
                    "required": true
                }
            ]
        },
        {
            "name": "messages",
            "description": "Manage messages.",
            "type": ApplicationCommandOptionType.SubcommandGroup,
            "options": [
                {
                    "name": "send",
                    "description": "Used to send a message to a channel or user.",
                    "type": ApplicationCommandOptionType.Subcommand,
                    "options": [
                        {
                            "name": "id",
                            "description": "The channel/user ID to send a message to.",
                            "type": ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "content",
                            "description": "The content to use for the message.",
                            "type": ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "reply",
                            "description": "A message ID representing a message to reply to.",
                            "type": ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "tts",
                            "description": "Whether or not the message should use TTS.",
                            "type": ApplicationCommandOptionType.Boolean,
                            "required": false
                        },
                        {
                            "name": "button",
                            "description": "JSON object containing a single button if needed.",
                            "type": ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "links",
                            "description": "Up to 5 links can be included as buttons. Format: 'title,url;title2,url2'.",
                            "type": ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "hide-response",
                            "description": "Whether or not to hide the response.",
                            "type": ApplicationCommandOptionType.Boolean,
                            "required": false
                        }
                    ]
                },
                {
                    "name": "edit",
                    "description": "Used to edit any previously sent message.",
                    "type": ApplicationCommandOptionType.Subcommand,
                    "options": [
                        {
                            "name": "channel",
                            "description": "The channel where the message is stored.",
                            "type": ApplicationCommandOptionType.Channel,
                            "channelTypes": ["GUILD_TEXT", "GUILD_NEWS"],
                            "required": true
                        },
                        {
                            "name": "message-id",
                            "description": "The message ID of the message to edit.",
                            "type": ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "content",
                            "description": "The content to use for the edited message.",
                            "type": ApplicationCommandOptionType.String,
                            "required": true
                        }
                    ]
                }
            ]
        },
        {
            "name": "logs",
            "description": "Manage messages.",
            "type": ApplicationCommandOptionType.SubcommandGroup,
            "options": [
                {
                    "name": "usage",
                    "description": "View & filter the usage logs.",
                    "type": ApplicationCommandOptionType.Subcommand,
                    "options": [
                        {
                            "name": "guild-id",
                            "description": "Guild ID to filter for.",
                            "type": ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "channel-id",
                            "description": "Channel ID to filter for.",
                            "type": ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "user-id",
                            "description": "User ID to filter for.",
                            "type": ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "action-name",
                            "description": "Action (or command) name to filter for.",
                            "type": ApplicationCommandOptionType.String,
                            "required": false
                        }
                    ]
                },
                {
                    "name": "status",
                    "description": "View & filter the status logs.",
                    "type": ApplicationCommandOptionType.Subcommand,
                    "options": [
                        {
                            "name": "timestamp",
                            "description": "Timestamp to filter for.",
                            "type": ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "type",
                            "description": "Status type to filter for.",
                            "type": ApplicationCommandOptionType.String,
                            "required": false
                        }
                    ]
                }
            ]
        },
        {
            "name": "block",
            "description": "Block or unblock a user from using the bot.",
            "type": ApplicationCommandOptionType.Subcommand,
            "options": [
                {
                    "name": "member",
                    "description": "The member to block from using the bot.",
                    "type": ApplicationCommandOptionType.User,
                    "required": true
                }
            ]
        }
    ],
    execute: async ({interaction, userdata}) => {
        const group = interaction.options.getSubcommandGroup(false);
        const subCommand = interaction.options.getSubcommand(false);
        const cmd = functions.get(`${group ? group + '/' : ''}${subCommand}`);
        if(!cmd) return `Something must have gone wrong, because this isn't a command!`;
        return await cmd.execute({interaction, userdata}); // Make sure to return a valid message!
    }
};