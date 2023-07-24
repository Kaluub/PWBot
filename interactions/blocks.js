import DefaultInteraction from "../classes/defaultInteraction.js";
import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionType, SlashCommandAttachmentOption, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import Locale from "../classes/locale.js";
import sharp from "sharp";
import blockMap from "../gen/blockmap.json" assert { type: "json" };

const maxWidth = 80;
const maxHeight = 57;

class BlocksInteraction extends DefaultInteraction {
    static name = "blocks";
    static applicationCommand = new SlashCommandBuilder()
        .setName(BlocksInteraction.name)
        .setDescription("Transform an image into in-game blocks.")
        .addAttachmentOption(
            new SlashCommandAttachmentOption()
                .setName("image")
                .setDescription("The image you would like to transform.")
                .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("style")
                .setDescription("The style rule for your blocks to use. Default: Pixel backbrounds only")
                .setRequired(false)
                .setChoices(
                    {
                        name: "All blocks",
                        value: "all"
                    },
                    {
                        name: "Pixel backbrounds only",
                        value: "pixel_backgrounds_only",
                    },
                    {
                        name: "Pixel blocks only",
                        value: "pixel_blocks_only"
                    }
                )
        )
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName("width")
                .setDescription("Width in blocks of the output image. Default: Automatic")
                .setMinValue(1)
                .setMaxValue(80)
                .setRequired(false)
        )
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName("height")
                .setDescription("Height in blocks of the output image. Default: Automatic")
                .setMinValue(1)
                .setMaxValue(57)
                .setRequired(false)
        )
        

    constructor() {
        super(BlocksInteraction.name, [InteractionType.ApplicationCommand]);
        this.defer = true;
        this.imageCache = new Map();
    }

    static allowedContentTypes = ["image/png", "image/jpeg", "image.webp"];


    /**
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const attachment = interaction.options.getAttachment("image");
        const style = interaction.options.getString("style", false) ?? "pixel_backgrounds_only";
        let width = interaction.options.getInteger("width", false) ?? null;
        let height = interaction.options.getInteger("height", false) ?? null;

        const noCustomSize = width == null && height == null;

        const list = blockMap[style];

        if (!BlocksInteraction.allowedContentTypes.includes(attachment.contentType))
            return Locale.text(interaction, "UNSUPPORTED_FORMAT");
        
        if (attachment.size > 10000000)
            return Locale.text(interaction, "FILE_TOO_LARGE");
        
        // Now time to manage the image...
        const rawData = await fetch(attachment.url);
        if (!rawData.ok)
            return Locale.text(interaction, "FAILED_FETCH_IMAGE");
        
        const buffer = await rawData.arrayBuffer();

        const image = sharp(buffer);
        const metadata = await image.metadata();

        const ratio = Math.min(maxWidth / metadata.width, maxHeight / metadata.height);
        if (!width)
            width = Math.floor(metadata.width * ratio);
        if (!height)
            height = Math.floor(metadata.height * ratio);
        
        if (maxWidth >= metadata.width && maxHeight >= metadata.height && noCustomSize) {
            width = metadata.width;
            height = metadata.height;
        }
        
        image.resize(width, height);

        const resizedBuffer = await image.removeAlpha().raw().toBuffer();
        const pixelArray = new Uint8ClampedArray(resizedBuffer);

        const output = sharp({ create: { width: 32*width, height: 32*height, channels: 3, background: 'black' } });
        const compositeArray = [];

        let blocksNeeded = {};

        let x = 0;
        let y = 0;
        for (let i = 0; i < pixelArray.length; i += 3) {
            const r = pixelArray[i];
            const g = pixelArray[i + 1];
            const b = pixelArray[i + 2];

            const item = this.determineClosestColor(r, g, b, list);
            let blockImage = this.imageCache.get(item.name);

            // Cache it if not yet done
            if (!blockImage) {
                blockImage = await sharp("./assets/blocks/" + item.filename).toBuffer();
                this.imageCache.set(item.name, blockImage);
            }

            compositeArray.push({ top: 32*y, left: 32*x, input: blockImage });

            if (!blocksNeeded[item.name])
                blocksNeeded[item.name] = 0;
            blocksNeeded[item.name] += 1;

            x += 1;
            if (x >= width) {
                y += 1;
                x = 0;
            }
        }

        output.composite(compositeArray).png();
        const outputBuffer = await output.toBuffer();

        const blocksImage = new AttachmentBuilder(outputBuffer)
            .setName("blocks.png")
        
        let blocksNeededString = "Blocks needed for the build:";
        for (const name in blocksNeeded) {
            const value = blocksNeeded[name];
            blocksNeededString += `\n - ${name} x${value}`;
        }

        const blocksNeededAttachment = new AttachmentBuilder(Buffer.from(blocksNeededString))
            .setName("requirements.txt")
        
        const embed = new EmbedBuilder()
            .setTitle("Result:")
            .setColor("#66AABB")
            .setDescription(`Stats:\nWidth: ${width} blocks\nHeight: ${height} blocks\nBlocks needed: ${width * height} blocks`)
            .setImage("attachment://blocks.png")

        return { embeds: [embed], files: [blocksImage, blocksNeededAttachment] }
    }

    determineClosestColor(r, g, b, list) {
        let closestDistance = Infinity;
        let closestItem = null;
        for (const item of list) {
            const distance = Math.pow(item.color[0] - r, 2) + Math.pow(item.color[1] - g, 2) + Math.pow(item.color[2] - b, 2)
            if (closestDistance > distance) {
                closestDistance = distance;
                closestItem = item;
            }
        }
        return closestItem;
    }
}

export default BlocksInteraction;