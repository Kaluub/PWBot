import { ButtonInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, BaseInteraction } from "discord.js";
import Locale from "./locale.js";

class DefaultInteraction {
    static disabled = false;
    static applicationCommand = null;
    static guilds = [];

    constructor(name, interactionTypes = []) {
        this.name = name;
        this.interactionTypes = interactionTypes;
        this.defer = false;
        this.ephemeral = false;
        this.updateIfComponent = false;
    }

    isValidInteractionType(interaction) {
        return this.interactionTypes.length ? this.interactionTypes.includes(interaction.type) : true;
    }

    getStringArgument(interaction, name, index) {
        return (interaction?.options?.getString(name) ?? interaction?.customId?.split("/")[index]);
    }

    getIntegerArgument(interaction, name, index) {
        return (interaction?.options?.getInteger(name) ?? parseInt(interaction?.customId?.split("/")[index]));
    }

    /**
     * 
     * @param {BaseInteraction|ChatInputCommandInteraction|ContextMenuCommandInteraction|ButtonInteraction} interaction 
     */
    async execute(interaction) {
        return Locale.text(interaction, "DEFAULT_COMMAND");
    }
}

export default DefaultInteraction;